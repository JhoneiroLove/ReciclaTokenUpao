// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ReciclaToken
 * @dev Token ERC-20 para el sistema de incentivos de reciclaje ReciclaUPAO
 */
contract ReciclaToken is ERC20, AccessControl, Pausable {
    // ROLES
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_MANAGER_ROLE =
        keccak256("WHITELIST_MANAGER_ROLE");

    // CONSTANTES
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;

    // STATE VARIABLES
    uint256 private _totalMinted;
    mapping(address => bool) private _whitelist;
    mapping(address => string) private _userDNI;
    mapping(address => uint256) public totalTokensEarnedByUser;
    mapping(address => uint256) public totalTokensSpentByUser;

    // EVENTS
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
        _grantRole(MINTER_ROLE, backendWallet);
        _grantRole(BURNER_ROLE, backendWallet);
        _grantRole(WHITELIST_MANAGER_ROLE, backendWallet);
        _grantRole(PAUSER_ROLE, admin);
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

    // MINTING FUNCTIONS
    function mintForActivity(
        address to,
        uint256 amount,
        string memory reason
    ) external onlyRole(MINTER_ROLE) onlyWhitelisted(to) whenNotPaused {
        require(to != address(0), "ReciclaToken: Cannot mint to zero address");
        require(amount > 0, "ReciclaToken: Amount must be greater than zero");
        require(
            _totalMinted + amount <= MAX_SUPPLY,
            "ReciclaToken: Would exceed max supply"
        );

        _mint(to, amount);
        _totalMinted += amount;
        totalTokensEarnedByUser[to] += amount;

        emit TokensMinted(to, amount, reason);
    }
    function mintBatch(
        address[] memory recipients,
        uint256[] memory amounts,
        string memory reason
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(
            recipients.length == amounts.length,
            "ReciclaToken: Arrays length mismatch"
        );
        require(recipients.length > 0, "ReciclaToken: Empty arrays");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(
            _totalMinted + totalAmount <= MAX_SUPPLY,
            "ReciclaToken: Would exceed max supply"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                recipients[i] != address(0),
                "ReciclaToken: Cannot mint to zero address"
            );
            require(
                _whitelist[recipients[i]],
                "ReciclaToken: Recipient not whitelisted"
            );
            require(
                amounts[i] > 0,
                "ReciclaToken: Amount must be greater than zero"
            );

            _mint(recipients[i], amounts[i]);
            totalTokensEarnedByUser[recipients[i]] += amounts[i];

            emit TokensMinted(recipients[i], amounts[i], reason);
        }

        _totalMinted += totalAmount;
    }

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