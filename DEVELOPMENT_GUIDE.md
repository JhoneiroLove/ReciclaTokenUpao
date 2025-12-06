# Guía de Desarrollo - ReciclaUPAO

Este documento detalla todas las fases de desarrollo del proyecto ReciclaUPAO, desde la concepción hasta el deployment en producción.

> **⚠️ NOTA IMPORTANTE:** Este documento contiene referencias históricas a una ICO (Oferta Inicial de Monedas) que **NO forman parte del proyecto actual**. ReciclaUPAO es un **sistema de incentivos tokenizado** donde los tokens REC se distribuyen exclusivamente como **recompensas** por actividades de reciclaje verificadas. Los tokens **NO se venden al público**. Cualquier mención a ICO, venta de tokens, o conceptos relacionados debe considerarse obsoleta y solo se mantiene con fines de referencia histórica del desarrollo.

## Tabla de Contenidos

1. [Fase 1: Análisis y Diseño](#fase-1-análisis-y-diseño)
2. [Fase 2: Configuración del Proyecto](#fase-2-configuración-del-proyecto)
3. [Fase 3: Desarrollo de Smart Contracts](#fase-3-desarrollo-de-smart-contracts)
4. [Fase 4: Scripts de Interacción](#fase-4-scripts-de-interacción)
5. [Fase 5: Testing Local](#fase-5-testing-local)
6. [Fase 6: Preparación para Producción](#fase-6-preparación-para-producción)
7. [Problemas Comunes y Soluciones](#problemas-comunes-y-soluciones)

---

## Fase 1: Análisis y Diseño

### Objetivos del Proyecto

Desarrollar un sistema de incentivos de reciclaje universitario basado en blockchain que:

- Reemplace el sistema centralizado de puntos existente
- Garantice transparencia y trazabilidad en las recompensas
- Vincule identidades de usuarios con DNI para prevenir fraude
- Permita acuñación dinámica de tokens basada en actividades verificadas
- Facilite el canje de tokens por recompensas físicas

### Documentos Analizados

**Propuesta ReciclaUPAO:**

- Sistema híbrido: Spring Boot 3.1.5 + MySQL como backend, blockchain como fuente de verdad
- Token REC (ERC-20) en Polygon
- Supply máximo: 10,000,000 REC
- **Sistema de Recompensas Tokenizado**: Los tokens se distribuyen como recompensas por actividades de reciclaje verificadas
- **NO es una ICO**: Los tokens no se venden al público, solo se otorgan como incentivos

**Proyecto de Referencia (PetCareToken):**

- Implementación básica de ERC-20 con Hardhat
- Scripts TypeScript para interacción
- Limitaciones identificadas: sin whitelist, sin gestión de wallets custodiadas

### Decisiones de Arquitectura

**Smart Contracts:**

- ReciclaToken: ERC-20 con AccessControl, Pausable, Whitelist para sistema de recompensas

**Roles Definidos:**

- DEFAULT_ADMIN_ROLE: Administrador principal
- MINTER_ROLE: Backend para acuñar tokens
- BURNER_ROLE: Backend para quemar tokens
- PAUSER_ROLE: Admin para pausas de emergencia
- WHITELIST_MANAGER_ROLE: Backend para gestionar whitelist

**Tecnologías Seleccionadas:**

- Solidity 0.8.28
- Hardhat 2.22.0 (version estable)
- OpenZeppelin Contracts 5.4.0
- TypeScript para scripts
- Ethers.js v6 para interacción

---

## Fase 2: Configuración del Proyecto

### Inicialización del Proyecto

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox typescript ts-node tsx
npm install @openzeppelin/contracts
```

### Estructura de Directorios Creada

```
recicla-upao-ico/
├── contracts/
├── scripts/
├── test/
├── ignition/modules/
├── deployments/
├── artifacts/
├── cache/
├── typechain-types/
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
├── .env.example
├── README.md
└── LICENSE
```

### Configuración de Hardhat

**hardhat.config.ts:**

- Versión de Solidity: 0.8.28
- Optimizer habilitado: 200 runs
- Red localhost: <http://127.0.0.1:8545>
- Sin ESM (type: "module" removido para compatibilidad)

### Configuración de TypeScript

**tsconfig.json:**

- Target: ES2022
- Module: nodenext
- Strict mode habilitado
- Source maps para debugging

### Dependencias Finales Instaladas

```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
    "@nomicfoundation/hardhat-ethers": "^3.0.0",
    "@nomicfoundation/hardhat-ignition": "^0.15.15",
    "@nomicfoundation/hardhat-ignition-ethers": "^0.15.0",
    "@nomicfoundation/hardhat-network-helpers": "^1.0.0",
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "@nomicfoundation/hardhat-verify": "^2.0.0",
    "@nomicfoundation/ignition-core": "^0.15.14",
    "@typechain/ethers-v6": "^0.5.0",
    "@typechain/hardhat": "^9.0.0",
    "@types/chai": "^4.3.20",
    "@types/mocha": "^10.0.10",
    "@types/node": "^22.18.6",
    "chai": "^5.3.3",
    "ethers": "^6.15.0",
    "hardhat": "^2.22.0",
    "hardhat-gas-reporter": "^1.0.8",
    "mocha": "^11.7.2",
    "solidity-coverage": "^0.8.1",
    "ts-node": "^10.9.2",
    "tsx": "^4.20.6",
    "typechain": "^8.3.0",
    "typescript": "~5.8.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.4.0"
  }
}
```

---

## Fase 3: Desarrollo de Smart Contracts

### ReciclaToken.sol

**Características Implementadas:**

- Herencia múltiple: ERC20, AccessControl, Pausable
- Constante MAX_SUPPLY: 10,000,000 tokens
- Mapping de whitelist con vinculación a DNI (hash)
- Tracking de tokens ganados y gastados por usuario
- Funciones de acuñación con validación de whitelist
- Funciones de quema con registro de razón
- Eventos personalizados para auditoría

**Funciones Principales:**

- `mintForActivity`: Acuña tokens por actividad verificada
- `mintBatch`: Acuñación múltiple para optimizar gas
- `burnForRedemption`: Quema tokens con registro de canje
- `addToWhitelist`: Agrega usuario individual
- `addMultipleToWhitelist`: Batch whitelist
- `pause/unpause`: Control de emergencia
- `getNetBalance`: Consulta earned, spent, current

**Eventos Emitidos:**

- TokensMinted(address to, uint256 amount, string reason)
- TokensBurned(address from, uint256 amount, string reason)
- UserWhitelisted(address user, string dniHash)
- UserRemovedFromWhitelist(address user)
- EmergencyPaused(address by)
- EmergencyUnpaused(address by)

### ReciclaICO.sol

**Características Implementadas:**

- Gestión completa de ICO con ciclo de vida
- Soft cap y hard cap configurables
- Sistema de descuentos progresivos por semana
- Límites de compra mínimo y máximo
- Sistema de refund si no se alcanza soft cap
- Tracking de contribuyentes
- Pausable para emergencias

**Funciones Principales:**

- `startICO`: Inicia ICO con duración especificada
- `buyTokens`: Compra tokens con descuento automático
- `finalizeICO`: Finaliza ICO al cumplir condiciones
- `claimRefund`: Permite refund si soft cap no alcanzado
- `withdrawFunds`: Owner retira fondos si soft cap alcanzado
- `withdrawUnsoldTokens`: Retira tokens no vendidos
- `calculateTokenAmount`: Calcula tokens con descuento
- `getICOProgress`: Retorna métricas de progreso

**Sistema de Descuentos:**

- Semana 1: 15%
- Semana 2: 10%
- Semana 3: 5%
- Semana 4+: 0%

**Eventos Emitidos:**

- TokensPurchased(address buyer, uint256 maticAmount, uint256 tokenAmount, uint256 discount)
- ICOStarted(uint256 startTime, uint256 endTime)
- ICOFinalized(uint256 totalRaised, uint256 totalTokensSold, bool softCapReached)
- RefundClaimed(address buyer, uint256 amount)
- FundsWithdrawn(address owner, uint256 amount)

### Errores Resueltos Durante Desarrollo

**Error 1: ReciclaICO receive() function**

- Problema: Función receive() intentaba llamar buyTokens() pero no era visible
- Solución: Eliminada función receive(), usuarios llaman directamente buyTokens()

**Error 2: supportsInterface override**

- Problema: Override incorrecto con ERC20 y AccessControl
- Solución: Solo override de AccessControl, ERC20 no tiene supportsInterface

**Error 3: Hardhat config type discriminator**

- Problema: Red hardhat no debe tener propiedad type
- Solución: Eliminada configuración de red hardhat, solo localhost

---

## Fase 4: Scripts de Interacción

### Script de Configuración (_config.ts)

**Funcionalidades:**

- Provider configuration para red local
- Lectura de direcciones desplegadas desde deployments/localhost.json
- Carga de ABIs desde artifacts
- Obtención de signers (admin, backend, users)
- Utilidades de formato (formatREC, parseREC, formatMATIC, parseMATIC)

**Signers Predefinidos:**

- Signer 0: Admin
- Signer 1: Backend
- Signer 2-5: Usuarios demo

### Script de Deployment (deploy.ts)

**Proceso de Deployment:**

1. Obtiene deployer (cuenta #0)
2. Define adminAddress y backendAddress
3. Despliega ReciclaToken con roles
4. Despliega ReciclaICO con parámetros
5. Guarda direcciones en deployments/localhost.json

**Parámetros ICO:**

- tokenPrice: 0.1 MATIC
- softCap: 50,000 MATIC
- hardCap: 500,000 MATIC
- minPurchase: 100 REC
- maxPurchase: 100,000 REC

### Script de Setup Inicial (setup-initial.ts)

**Pasos Ejecutados:**

1. Agregar admin a whitelist
2. Acuñar 3,000,000 REC para ICO
3. Transferir tokens al contrato ICO
4. Agregar usuarios demo a whitelist
5. Iniciar ICO con duración de 30 días
6. Verificar configuración completa

### Scripts de Consulta

**token-info.ts:**

- Información de red
- Datos del token
- Estado de la ICO
- Cronología y tiempo restante
- Progreso de ventas

**balances.ts:**

- Balance de administración
- Balance de usuarios
- Balance del contrato ICO
- Resumen de supply

### Scripts de Interacción

**buy-tokens.ts:**

- Parámetro: cantidad de MATIC (default: 10)
- Calcula tokens con descuento
- Ejecuta compra
- Muestra estado antes/después

**recycle-activity.ts:**

- Parámetros: cantidad REC, número de usuario
- Verifica whitelist
- Acuña tokens por actividad
- Actualiza tracking de earned

**redeem-reward.ts:**

- Parámetros: cantidad REC, número de usuario
- Verifica balance suficiente
- Quema tokens
- Actualiza tracking de spent

**events-live.ts:**

- Monitor en tiempo real de eventos
- Escucha: TokensMinted, TokensBurned, Transfer, TokensPurchased, etc.
- Presionar Ctrl+C para detener

**events-history.ts:**

- Parámetros: fromBlock, toBlock
- Consulta eventos históricos
- Muestra todos los eventos del rango especificado

**finalize-ico.ts:**

- Verifica estado de ICO
- Finaliza ICO
- Retira fondos si soft cap alcanzado
- Retira tokens no vendidos

---

## Fase 5: Testing Local

### Test Unitario Implementado

**ReciclaSystem.test.ts:**

Prueba el flujo completo de usuario:

1. Compra de tokens en ICO con descuento del 15%
2. Registro de actividad de reciclaje
3. Canje de recompensa
4. Verificación de balances y tracking
5. Verificación de progreso de ICO
6. Verificación de supply management

**Cobertura:**

- Deployment de contratos
- Configuración inicial
- Sistema de whitelist
- Acuñación de tokens
- Compra en ICO con descuentos
- Quema de tokens
- Tracking de earned/spent
- Eventos emitidos

### Procedimiento de Testing Local

1. Iniciar nodo local: `npm run node`
2. Desplegar contratos: `npm run deploy:local`
3. Configurar sistema: `npm run setup`
4. Ejecutar tests: `npm test`
5. Verificar resultados

### Escenarios Probados

- Usuario compra 10 MATIC de tokens (recibe 115 REC con descuento)
- Usuario recicla y gana 50 REC
- Usuario canjea 25 REC por recompensa
- Balance final: 140 REC
- Tracking: 50 earned, 25 spent

---

## Fase 6: Preparación para Producción

Esta fase describe las modificaciones necesarias para desplegar el sistema en un entorno de producción real.

### 6.1 Configuración de Red

#### Actualizar hardhat.config.ts

Agregar configuración para redes de producción:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

export default config;
```

#### Crear archivo .env

```
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 6.2 Modificaciones en Smart Contracts

#### ReciclaToken.sol - Ajustes de Producción

**Cambios requeridos:**

1. Remover datos de prueba hardcodeados
2. Implementar sistema de vesting para tokens del equipo
3. Agregar función de recuperación de tokens ERC20 enviados por error
4. Implementar timelock para funciones administrativas críticas

Ejemplo de función de recuperación:

```solidity
function recoverERC20(address tokenAddress, uint256 amount) 
    external 
    onlyRole(DEFAULT_ADMIN_ROLE) 
{
    require(tokenAddress != address(this), "Cannot recover REC tokens");
    IERC20(tokenAddress).transfer(msg.sender, amount);
}
```

#### ReciclaICO.sol - Ajustes de Producción

**Cambios requeridos:**

1. Implementar lista blanca de compradores (whitelist de contribuyentes)
2. Agregar límite de gas para transacciones
3. Implementar sistema anti-bot con cooldown period
4. Agregar función de emergencia para pausar compras
5. Implementar vesting schedule para tokens del equipo

Ejemplo de cooldown:

```solidity
mapping(address => uint256) public lastPurchaseTime;
uint256 public constant PURCHASE_COOLDOWN = 60; // 60 segundos

modifier cooldownPeriod() {
    require(
        block.timestamp >= lastPurchaseTime[msg.sender] + PURCHASE_COOLDOWN,
        "ReciclaICO: Cooldown period active"
    );
    _;
    lastPurchaseTime[msg.sender] = block.timestamp;
}

function buyTokens() external payable cooldownPeriod {
    // código existente
}
```

### 6.3 Scripts de Deployment para Producción

#### Crear deploy-mumbai.ts

```typescript
import hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying to Mumbai Testnet...");
  
  // Verificar saldo suficiente
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance < hre.ethers.parseEther("0.1")) {
    throw new Error("Insufficient MATIC for deployment");
  }
  
  // Deployment con parámetros de producción
  const adminAddress = deployer.address;
  const backendAddress = process.env.BACKEND_ADDRESS || deployer.address;
  
  // Deploy con confirmaciones adicionales
  const ReciclaToken = await hre.ethers.getContractFactory("ReciclaToken");
  const reciclaToken = await ReciclaToken.deploy(adminAddress, backendAddress);
  await reciclaToken.waitForDeployment();
  await reciclaToken.deploymentTransaction()?.wait(5); // Esperar 5 confirmaciones
  
  const tokenAddress = await reciclaToken.getAddress();
  console.log("ReciclaToken deployed to:", tokenAddress);
  
  // Continuar con ICO...
  
  // Verificar contratos en Polygonscan
  console.log("Verifying contracts...");
  await hre.run("verify:verify", {
    address: tokenAddress,
    constructorArguments: [adminAddress, backendAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### Actualizar package.json

```json
{
  "scripts": {
    "deploy:mumbai": "hardhat run scripts/deploy-mumbai.ts --network mumbai",
    "deploy:polygon": "hardhat run scripts/deploy-polygon.ts --network polygon",
    "verify:mumbai": "hardhat verify --network mumbai",
    "verify:polygon": "hardhat verify --network polygon"
  }
}
```

### 6.4 Integración con Backend Spring Boot

#### Estructura de Integración

El backend Spring Boot debe:

1. Mantener una wallet con MINTER_ROLE y BURNER_ROLE
2. Firmar transacciones para acuñar/quemar tokens
3. Almacenar hashes de DNI en base de datos
4. Verificar actividades de reciclaje antes de acuñar
5. Procesar canjes antes de quemar tokens

#### Configuración de Wallet en Backend

```java
@Configuration
public class BlockchainConfig {
    
    @Value("${blockchain.rpc.url}")
    private String rpcUrl;
    
    @Value("${blockchain.private.key}")
    private String privateKey;
    
    @Value("${blockchain.token.address}")
    private String tokenAddress;
    
    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(rpcUrl));
    }
    
    @Bean
    public Credentials credentials() {
        return Credentials.create(privateKey);
    }
}
```

#### Servicio de Acuñación

```java
@Service
public class TokenMintingService {
    
    @Autowired
    private Web3j web3j;
    
    @Autowired
    private Credentials credentials;
    
    public String mintTokensForActivity(
        String userAddress, 
        BigInteger amount, 
        String activityDescription
    ) throws Exception {
        
        // Cargar contrato
        ReciclaToken contract = ReciclaToken.load(
            tokenAddress, 
            web3j, 
            credentials, 
            new DefaultGasProvider()
        );
        
        // Ejecutar mint
        TransactionReceipt receipt = contract
            .mintForActivity(userAddress, amount, activityDescription)
            .send();
            
        return receipt.getTransactionHash();
    }
}
```

### 6.5 Sistema de Monitoreo y Alertas

#### Implementar Monitoreo de Eventos

Crear servicio de escucha de eventos:

```typescript
import { ethers } from "ethers";

class EventMonitorService {
  private provider: ethers.Provider;
  private tokenContract: ethers.Contract;
  private icoContract: ethers.Contract;
  
  async startMonitoring() {
    // Escuchar eventos críticos
    this.tokenContract.on("EmergencyPaused", async (by, event) => {
      await this.sendAlert("CRITICAL: Token contract paused", {
        pausedBy: by,
        block: event.blockNumber
      });
    });
    
    this.icoContract.on("ICOFinalized", async (raised, sold, capReached, event) => {
      await this.sendAlert("INFO: ICO Finalized", {
        totalRaised: ethers.formatEther(raised),
        tokensSold: ethers.formatEther(sold),
        softCapReached: capReached
      });
    });
  }
  
  private async sendAlert(message: string, data: any) {
    // Integrar con sistema de alertas (Slack, email, etc.)
    console.log(`[ALERT] ${message}`, data);
  }
}
```

#### Dashboard de Métricas

Implementar dashboard para monitorear:

- Total supply en circulación
- Tokens en ICO restantes
- Número de usuarios en whitelist
- Volumen de transacciones diarias
- Gas consumido
- Eventos de pausa/unpausa

### 6.6 Seguridad y Auditoría

#### Auditoría de Smart Contracts

Antes de producción:

1. Contratar auditoría profesional (CertiK, OpenZeppelin, etc.)
2. Implementar recomendaciones de auditoría
3. Realizar pruebas de penetración
4. Bug bounty program

#### Implementar Multisig Wallet

Para funciones administrativas críticas:

```solidity
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract ReciclaGovernance is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(minDelay, proposers, executors, msg.sender) {}
}
```

#### Rate Limiting en Backend

Implementar límites de transacciones por usuario:

```java
@Service
public class RateLimitService {
    
    private final ConcurrentHashMap<String, RateLimiter> limiters = 
        new ConcurrentHashMap<>();
    
    public boolean allowRequest(String userAddress) {
        RateLimiter limiter = limiters.computeIfAbsent(
            userAddress,
            k -> RateLimiter.create(10.0) // 10 requests per second
        );
        
        return limiter.tryAcquire();
    }
}
```

### 6.7 Documentación Adicional Requerida

#### Manual de Operaciones

Crear documentación para:

1. Procedimientos de deployment
2. Gestión de roles y permisos
3. Respuesta a incidentes
4. Procedimientos de actualización
5. Backup y recuperación

#### Documentación de API

Documentar endpoints del backend:

- POST /api/whitelist/add
- POST /api/activities/register
- POST /api/rewards/redeem
- GET /api/balance/:address
- GET /api/activities/history/:address

#### Guía de Usuario Final

Crear documentación para:

- Cómo crear una wallet
- Cómo participar en la ICO
- Cómo registrar actividades de reciclaje
- Cómo canjear recompensas
- Preguntas frecuentes

### 6.8 Plan de Deployment Gradual

#### Fase 1: Testnet (Mumbai)

1. Desplegar contratos en Mumbai
2. Configurar backend con RPC de Mumbai
3. Realizar pruebas exhaustivas con usuarios beta
4. Monitorear por al menos 2 semanas
5. Recopilar feedback y realizar ajustes

#### Fase 2: Mainnet Soft Launch

1. Desplegar en Polygon Mainnet
2. Limitar participación a grupo piloto (100 usuarios)
3. Monitorear métricas de rendimiento y costos de gas
4. Validar integración con backend en producción
5. Verificar que todos los procesos funcionen correctamente

#### Fase 3: Lanzamiento Completo

1. Abrir ICO al público general
2. Campaña de marketing
3. Soporte técnico 24/7
4. Monitoreo continuo de métricas
5. Iteraciones basadas en feedback

### 6.9 Costos Estimados de Producción

#### Deployment en Polygon Mainnet

- Deployment de ReciclaToken: ~0.5 MATIC
- Deployment de ReciclaICO: ~0.4 MATIC
- Configuración inicial: ~0.2 MATIC
- Total estimado: ~1.1 MATIC (~$1 USD)

#### Costos Operacionales Mensuales

- RPC Provider (Alchemy/Infura): $0-$49/mes
- Verificación de contratos: Gratis (Polygonscan)
- Monitoreo y alertas: $0-$29/mes
- Backend hosting: Variable según infraestructura
- Gas para operaciones: Variable según uso

#### Optimizaciones de Gas

1. Usar mintBatch en lugar de mint individual
2. Implementar meta-transactions para usuarios
3. Optimizar almacenamiento de datos
4. Usar eventos en lugar de almacenamiento cuando sea posible

### 6.10 Checklist Pre-Producción

**Smart Contracts:**

- [ ] Auditoría de seguridad completada
- [ ] Todas las recomendaciones implementadas
- [ ] Tests de cobertura >90%
- [ ] Documentación de código completa
- [ ] Gas optimization realizada

**Backend:**

- [ ] Integración con blockchain probada
- [ ] API endpoints documentados
- [ ] Rate limiting implementado
- [ ] Sistema de logging configurado
- [ ] Backup automático configurado

**Infraestructura:**

- [ ] RPC provider configurado con redundancia
- [ ] Monitoreo de eventos implementado
- [ ] Sistema de alertas configurado
- [ ] Dashboard de métricas desplegado
- [ ] Plan de recuperación ante desastres documentado

**Legal y Compliance:**

- [ ] Términos y condiciones redactados
- [ ] Política de privacidad publicada
- [ ] Cumplimiento con regulaciones locales
- [ ] KYC/AML implementado si es requerido
- [ ] Disclaimer de riesgos visible

**Usuario:**

- [ ] Guía de usuario completa
- [ ] FAQ publicado
- [ ] Video tutoriales creados
- [ ] Soporte técnico preparado
- [ ] Plan de comunicación definido

---

## Problemas Comunes y Soluciones

### Durante Desarrollo

**Problema: Error de importación de ethers**

- Causa: Conflicto entre ESM y CommonJS
- Solución: Remover "type": "module" de package.json

**Problema: Hardhat config type discriminator**

- Causa: Configuración incorrecta de red hardhat
- Solución: Eliminar propiedad type de red hardhat

**Problema: Dependencias incompatibles**

- Causa: Versiones conflictivas de paquetes
- Solución: Usar --legacy-peer-deps en npm install

### Durante Testing

**Problema: Address not whitelisted**

- Causa: Usuario no agregado a whitelist antes de mint
- Solución: Agregar a whitelist antes de cualquier operación

**Problema: Gas estimation failed**

- Causa: Transacción revertirá, requiere más validación
- Solución: Verificar condiciones previas (balance, whitelist, etc.)

### En Producción

**Problema: Transacciones fallando**

- Causa: Gas price insuficiente durante alta congestión
- Solución: Implementar estimación dinámica de gas price

**Problema: RPC rate limiting**

- Causa: Exceso de requests al provider
- Solución: Implementar caching y batch requests

**Problema: Contratos no verificados**

- Causa: Constructor arguments incorrectos
- Solución: Verificar manualmente con flatten code

---

## Conclusión

Este proyecto implementa un sistema completo de incentivos de reciclaje basado en blockchain, desde el desarrollo local hasta las consideraciones necesarias para un deployment en producción. La arquitectura híbrida (blockchain + backend tradicional) permite aprovechar las ventajas de ambos mundos: transparencia y trazabilidad de blockchain con la eficiencia y familiaridad del desarrollo web tradicional.

Las modificaciones descritas en la Fase 6 son esenciales para garantizar un sistema seguro, escalable y confiable en un entorno de producción real.
