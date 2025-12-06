// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ReciclaToken
 * @dev Token ERC-20 para el sistema de incentivos de reciclaje ReciclaUPAO
 * Sistema de propuestas y multi-aprobación para descentralización
 */
contract ReciclaToken is ERC20, AccessControl, Pausable {
    // ROLES
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE"); // Backend propone actividades
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE"); // Admins/Centro de acopio aprueban
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_MANAGER_ROLE =
        keccak256("WHITELIST_MANAGER_ROLE");

    // CONSTANTES
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;
    uint8 public constant APROBACIONES_REQUERIDAS = 2; // 2 de N validadores

    // TIPOS DE MATERIAL Y SUS RATES (REC por kg)
    mapping(string => uint256) public ratesPorMaterial;

    // ESTRUCTURA DE ACTIVIDAD DE RECICLAJE
    struct ActividadReciclaje {
        uint256 id;
        address usuario;
        uint256 pesoKg;
        string tipoMaterial;
        string evidenciaIPFS; // Hash IPFS de la evidencia fotográfica
        uint256 tokensCalculados;
        uint256 timestamp;
        uint8 aprobaciones;
        bool ejecutada;
        bool rechazada;
        address propuestoPor;
    }

    // STATE VARIABLES
    uint256 private _totalMinted;
    uint256 public actividadCounter;

    mapping(address => bool) private _whitelist;
    mapping(address => string) private _userDNI;
    mapping(address => uint256) public totalTokensEarnedByUser;
    mapping(address => uint256) public totalTokensSpentByUser;

    // Actividades propuestas
    mapping(uint256 => ActividadReciclaje) public actividades;
    mapping(uint256 => mapping(address => bool)) public actividadAprobadaPor;

    // EVENTS
    event ActividadPropuesta(
        uint256 indexed actividadId,
        address indexed usuario,
        uint256 pesoKg,
        string tipoMaterial,
        uint256 tokensCalculados,
        string evidenciaIPFS
    );
    event ActividadAprobada(
        uint256 indexed actividadId,
        address indexed validador,
        uint8 aprobacionesTotales
    );
    event ActividadRechazada(
        uint256 indexed actividadId,
        address indexed validador,
        string razon
    );
    event ActividadEjecutada(
        uint256 indexed actividadId,
        address indexed usuario,
        uint256 tokensAcunados
    );
    event RateMaterialActualizado(string tipoMaterial, uint256 nuevoRate);

    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event UserWhitelisted(address indexed user, string dniHash);
    event UserRemovedFromWhitelist(address indexed user);
    event EmergencyPaused(address indexed by);
    event EmergencyUnpaused(address indexed by);

    // MODIFIERS
    modifier onlyWhitelisted(address account) {
        require(_whitelist[account], "ReciclaToken: Address not whitelisted");
        _;
    }

    // CONSTRUCTOR
    constructor(
        address admin,
        address backendWallet
    ) ERC20("ReciclaToken", "REC") {
        require(
            admin != address(0),
            "ReciclaToken: Admin cannot be zero address"
        );
        require(
            backendWallet != address(0),
            "ReciclaToken: Backend wallet cannot be zero address"
        );

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROPOSER_ROLE, backendWallet); // Backend solo puede PROPONER
        _grantRole(BURNER_ROLE, backendWallet);
        _grantRole(WHITELIST_MANAGER_ROLE, backendWallet);
        _grantRole(PAUSER_ROLE, admin);

        // Configurar rates iniciales (REC por kg)
        ratesPorMaterial["plastico"] = 15 * 10 ** 18; // 15 REC por kg
        ratesPorMaterial["papel"] = 10 * 10 ** 18; // 10 REC por kg
        ratesPorMaterial["vidrio"] = 12 * 10 ** 18; // 12 REC por kg
        ratesPorMaterial["metal"] = 20 * 10 ** 18; // 20 REC por kg
        ratesPorMaterial["carton"] = 8 * 10 ** 18; // 8 REC por kg
        ratesPorMaterial["organico"] = 5 * 10 ** 18; // 5 REC por kg
    }

    // WHITELIST FUNCTIONS
    function addToWhitelist(
        address user,
        string memory dniHash
    ) external onlyRole(WHITELIST_MANAGER_ROLE) {
        require(
            user != address(0),
            "ReciclaToken: Cannot whitelist zero address"
        );
        require(
            bytes(dniHash).length > 0,
            "ReciclaToken: DNI hash cannot be empty"
        );

        _whitelist[user] = true;
        _userDNI[user] = dniHash;

        emit UserWhitelisted(user, dniHash);
    }
    function addMultipleToWhitelist(
        address[] memory users,
        string[] memory dniHashes
    ) external onlyRole(WHITELIST_MANAGER_ROLE) {
        require(
            users.length == dniHashes.length,
            "ReciclaToken: Arrays length mismatch"
        );
        require(users.length > 0, "ReciclaToken: Empty arrays");

        for (uint256 i = 0; i < users.length; i++) {
            require(
                users[i] != address(0),
                "ReciclaToken: Cannot whitelist zero address"
            );
            require(
                bytes(dniHashes[i]).length > 0,
                "ReciclaToken: DNI hash cannot be empty"
            );

            _whitelist[users[i]] = true;
            _userDNI[users[i]] = dniHashes[i];

            emit UserWhitelisted(users[i], dniHashes[i]);
        }
    }
    function removeFromWhitelist(
        address user
    ) external onlyRole(WHITELIST_MANAGER_ROLE) {
        require(_whitelist[user], "ReciclaToken: User not in whitelist");

        _whitelist[user] = false;
        delete _userDNI[user];

        emit UserRemovedFromWhitelist(user);
    }

    function isWhitelisted(address user) external view returns (bool) {
        return _whitelist[user];
    }

    function getUserDNI(address user) external view returns (string memory) {
        return _userDNI[user];
    }

    // ========== SISTEMA DE PROPUESTAS Y APROBACIONES ==========

    /**
     * @dev Backend propone una actividad de reciclaje (NO acuña tokens directamente)
     * @param usuario Dirección del usuario que recicló
     * @param pesoKg Peso del material reciclado en kilogramos
     * @param tipoMaterial Tipo de material (plastico, papel, vidrio, etc.)
     * @param evidenciaIPFS Hash IPFS de la evidencia fotográfica
     */
    function proponerActividad(
        address usuario,
        uint256 pesoKg,
        string memory tipoMaterial,
        string memory evidenciaIPFS
    )
        external
        onlyRole(PROPOSER_ROLE)
        onlyWhitelisted(usuario)
        whenNotPaused
        returns (uint256)
    {
        require(usuario != address(0), "ReciclaToken: Usuario invalido");
        require(pesoKg > 0, "ReciclaToken: Peso debe ser mayor a cero");
        require(
            bytes(tipoMaterial).length > 0,
            "ReciclaToken: Tipo de material requerido"
        );
        require(
            bytes(evidenciaIPFS).length > 0,
            "ReciclaToken: Evidencia IPFS requerida"
        );
        require(
            ratesPorMaterial[tipoMaterial] > 0,
            "ReciclaToken: Tipo de material no configurado"
        );

        uint256 tokensCalculados = calcularTokens(pesoKg, tipoMaterial);

        require(
            _totalMinted + tokensCalculados <= MAX_SUPPLY,
            "ReciclaToken: Excederia el supply maximo"
        );

        uint256 actividadId = actividadCounter;

        actividades[actividadId] = ActividadReciclaje({
            id: actividadId,
            usuario: usuario,
            pesoKg: pesoKg,
            tipoMaterial: tipoMaterial,
            evidenciaIPFS: evidenciaIPFS,
            tokensCalculados: tokensCalculados,
            timestamp: block.timestamp,
            aprobaciones: 0,
            ejecutada: false,
            rechazada: false,
            propuestoPor: msg.sender
        });

        emit ActividadPropuesta(
            actividadId,
            usuario,
            pesoKg,
            tipoMaterial,
            tokensCalculados,
            evidenciaIPFS
        );

        actividadCounter++;
        return actividadId;
    }

    /**
     * @dev Validador aprueba una actividad propuesta
     * @param actividadId ID de la actividad a aprobar
     */
    function aprobarActividad(
        uint256 actividadId
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused {
        ActividadReciclaje storage actividad = actividades[actividadId];

        require(
            actividad.usuario != address(0),
            "ReciclaToken: Actividad no existe"
        );
        require(!actividad.ejecutada, "ReciclaToken: Actividad ya ejecutada");
        require(!actividad.rechazada, "ReciclaToken: Actividad rechazada");
        require(
            !actividadAprobadaPor[actividadId][msg.sender],
            "ReciclaToken: Ya aprobaste esta actividad"
        );

        // Registrar aprobación
        actividadAprobadaPor[actividadId][msg.sender] = true;
        actividad.aprobaciones++;

        emit ActividadAprobada(actividadId, msg.sender, actividad.aprobaciones);

        // Si alcanza las aprobaciones requeridas, ejecutar acuñación
        if (actividad.aprobaciones >= APROBACIONES_REQUERIDAS) {
            _ejecutarActividad(actividadId);
        }
    }

    /**
     * @dev Validador rechaza una actividad propuesta
     * @param actividadId ID de la actividad a rechazar
     * @param razon Razón del rechazo
     */
    function rechazarActividad(
        uint256 actividadId,
        string memory razon
    ) external onlyRole(VALIDATOR_ROLE) whenNotPaused {
        ActividadReciclaje storage actividad = actividades[actividadId];

        require(
            actividad.usuario != address(0),
            "ReciclaToken: Actividad no existe"
        );
        require(!actividad.ejecutada, "ReciclaToken: Actividad ya ejecutada");
        require(!actividad.rechazada, "ReciclaToken: Actividad ya rechazada");

        actividad.rechazada = true;

        emit ActividadRechazada(actividadId, msg.sender, razon);
    }

    /**
     * @dev Ejecuta la acuñación de tokens para una actividad aprobada (interno)
     */
    function _ejecutarActividad(uint256 actividadId) private {
        ActividadReciclaje storage actividad = actividades[actividadId];

        _mint(actividad.usuario, actividad.tokensCalculados);
        _totalMinted += actividad.tokensCalculados;
        totalTokensEarnedByUser[actividad.usuario] += actividad
            .tokensCalculados;
        actividad.ejecutada = true;

        emit ActividadEjecutada(
            actividadId,
            actividad.usuario,
            actividad.tokensCalculados
        );

        emit TokensMinted(
            actividad.usuario,
            actividad.tokensCalculados,
            string(abi.encodePacked("Actividad #", _uint2str(actividadId)))
        );
    }

    /**
     * @dev Calcula tokens basado en peso y tipo de material
     * @param pesoKg Peso en kilogramos
     * @param tipoMaterial Tipo de material
     */
    function calcularTokens(
        uint256 pesoKg,
        string memory tipoMaterial
    ) public view returns (uint256) {
        uint256 ratePorKg = ratesPorMaterial[tipoMaterial];
        require(ratePorKg > 0, "ReciclaToken: Material no configurado");

        // pesoKg viene como entero (ej: 5 = 5kg)
        // ratePorKg ya incluye 10**18
        // Resultado: tokens en wei
        return (pesoKg * ratePorKg) / 1; // Se puede ajustar si pesoKg trae decimales
    }

    /**
     * @dev Admin actualiza el rate de un material
     */
    function actualizarRateMaterial(
        string memory tipoMaterial,
        uint256 nuevoRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(nuevoRate > 0, "ReciclaToken: Rate debe ser mayor a cero");

        ratesPorMaterial[tipoMaterial] = nuevoRate;

        emit RateMaterialActualizado(tipoMaterial, nuevoRate);
    }

    /**
     * @dev Obtiene información completa de una actividad
     */
    function getActividad(
        uint256 actividadId
    )
        external
        view
        returns (
            address usuario,
            uint256 pesoKg,
            string memory tipoMaterial,
            string memory evidenciaIPFS,
            uint256 tokensCalculados,
            uint256 timestamp,
            uint8 aprobaciones,
            bool ejecutada,
            bool rechazada,
            address propuestoPor
        )
    {
        ActividadReciclaje storage act = actividades[actividadId];
        return (
            act.usuario,
            act.pesoKg,
            act.tipoMaterial,
            act.evidenciaIPFS,
            act.tokensCalculados,
            act.timestamp,
            act.aprobaciones,
            act.ejecutada,
            act.rechazada,
            act.propuestoPor
        );
    }

    /**
     * @dev Verifica si un validador ya aprobó una actividad
     */
    function haAprobado(
        uint256 actividadId,
        address validador
    ) external view returns (bool) {
        return actividadAprobadaPor[actividadId][validador];
    }

    // ========== FUNCIONES DE QUEMADO ==========

    // BURNING FUNCTIONS
    function burnForRedemption(
        address from,
        uint256 amount,
        string memory reason
    ) external onlyRole(BURNER_ROLE) whenNotPaused {
        require(
            from != address(0),
            "ReciclaToken: Cannot burn from zero address"
        );
        require(amount > 0, "ReciclaToken: Amount must be greater than zero");
        require(
            balanceOf(from) >= amount,
            "ReciclaToken: Insufficient balance to burn"
        );

        _burn(from, amount);
        totalTokensSpentByUser[from] += amount;

        emit TokensBurned(from, amount, reason);
    }
    function burn(uint256 amount) external whenNotPaused {
        require(amount > 0, "ReciclaToken: Amount must be greater than zero");
        require(
            balanceOf(msg.sender) >= amount,
            "ReciclaToken: Insufficient balance to burn"
        );

        _burn(msg.sender, amount);
        totalTokensSpentByUser[msg.sender] += amount;

        emit TokensBurned(msg.sender, amount, "User self-burn");
    }

    // PAUSE FUNCTIONS
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    // VIEW FUNCTIONS

    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _totalMinted;
    }

    function getNetBalance(
        address user
    ) external view returns (uint256 earned, uint256 spent, uint256 current) {
        earned = totalTokensEarnedByUser[user];
        spent = totalTokensSpentByUser[user];
        current = balanceOf(user);
    }

    // INTERNAL UTILITY FUNCTIONS
    /**
     * @dev Convierte uint256 a string para eventos
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // OVERRIDE FUNCTIONS
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
