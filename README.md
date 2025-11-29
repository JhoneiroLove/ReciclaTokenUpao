# ReciclaUPAO - ICO & Token ERC-20

Sistema de incentivos de reciclaje universitario basado en blockchain. Token **REC (ReciclaToken)** implementado como ERC-20 en Polygon.

## Características

- Token ERC-20 con 10,000,000 REC de supply máximo
- Sistema de whitelist con vinculación a DNI
- Acuñación controlada por actividades de reciclaje verificadas
- ICO con soft cap (50K USD) y hard cap (500K USD)
- Descuentos por early adopters (15%, 10%, 5% por semana)
- Sistema de roles con AccessControl de OpenZeppelin
- Quema de tokens para canje de recompensas
- Sistema de pausa de emergencia

## Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/recicla-upao-ico.git
cd recicla-upao-ico
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Compilar contratos

```bash
npm run compile
```

## Desarrollo Local

### Iniciar red local de Hardhat

En una terminal, ejecuta y deja corriendo:

```bash
npm run node
```

Esto iniciará una blockchain local en `http://127.0.0.1:8545` con 20 cuentas de prueba.

### Desplegar contratos localmente

En otra terminal:

```bash
npm run deploy:local
```

### Configurar el sistema

```bash
npm run setup
```

Este script:

- Acuña 3,000,000 REC para la ICO
- Transfiere tokens al contrato ICO
- Agrega usuarios demo a la whitelist
- Inicia la ICO (30 días)

## Scripts Disponibles

### Consultas

```bash
# Ver información general del token e ICO
npm run info

# Ver balances de todos los actores
npm run balances

# Ver eventos históricos
npm run events:history

# Monitorear eventos en tiempo real
npm run events:live
```

### Interacciones

```bash
# Comprar tokens en la ICO (default: 10 MATIC)
npm run buy-tokens
npm run buy-tokens 50  # Comprar con 50 MATIC

# Registrar actividad de reciclaje (default: 50 REC, usuario 1)
npm run recycle
npm run recycle 100 2  # 100 REC para usuario 2

# Canjear recompensa (default: 25 REC, usuario 1)
npm run redeem
npm run redeem 50 1  # Canjear 50 REC del usuario 1

# Finalizar ICO
npm run finalize-ico
```

### Desarrollo

```bash
# Limpiar artifacts
npm run clean

# Compilar contratos
npm run compile

# Ejecutar tests
npm run test
```

## Arquitectura

```
recicla-upao-ico/
├── contracts/
│   ├── ReciclaToken.sol      # Token ERC-20 principal
│   └── ReciclaICO.sol         # Contrato de la ICO
├── scripts/
│   ├── deploy.ts              # Deployment de contratos
│   ├── setup-initial.ts       # Configuración inicial
│   ├── token-info.ts          # Consultar información
│   ├── balances.ts            # Ver balances
│   ├── buy-tokens.ts          # Comprar en ICO
│   ├── recycle-activity.ts    # Registrar reciclaje
│   ├── redeem-reward.ts       # Canjear recompensa
│   ├── events-live.ts         # Monitor de eventos
│   ├── events-history.ts      # Eventos históricos
│   └── finalize-ico.ts        # Finalizar ICO
├── ignition/
│   └── modules/
│       └── ReciclaModule.ts   # Módulo de Hardhat Ignition
└── test/                      # Tests unitarios
```

## Roles del Sistema

### ReciclaToken

- **DEFAULT_ADMIN_ROLE**: Administrador principal (otorga/revoca roles)
- **MINTER_ROLE**: Puede acuñar tokens (backend)
- **BURNER_ROLE**: Puede quemar tokens (backend)
- **PAUSER_ROLE**: Puede pausar el contrato (admin)
- **WHITELIST_MANAGER_ROLE**: Gestiona la whitelist (backend)

### ReciclaICO

- **Owner**: Administrador de la ICO (iniciar, finalizar, retirar fondos)

## Tokenomics

| Asignación | Tokens | Porcentaje | Propósito |
|------------|--------|------------|-----------|
| Recompensas estudiantes | 4,000,000 REC | 40% | Acuñación dinámica por actividades |
| ICO Pública | 3,000,000 REC | 30% | Venta pública |
| Equipo | 1,500,000 REC | 15% | Desarrollo (12 meses vesting) |
| Reserva estratégica | 1,000,000 REC | 10% | Marketing y partnerships |
| Liquidez DEX | 500,000 REC | 5% | Pools de liquidez |

## Despliegue en Testnet (Mumbai)

### 1. Configurar variables de entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita `.env`:

```bash
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/TU_API_KEY
PRIVATE_KEY=0xtu_clave_privada_de_metamask
```

### 2. Obtener MATIC de testnet

Visita: <https://faucet.polygon.technology/>

Pega tu dirección de wallet y solicita MATIC gratis.

### 3. Desplegar en Mumbai

```bash
npm run deploy:mumbai
```

## Smart Contracts

### ReciclaToken (ERC-20)

```solidity
// Principales funciones
function mintForActivity(address to, uint256 amount, string reason)
function burnForRedemption(address from, uint256 amount, string reason)
function addToWhitelist(address user, string dniHash)
function pause() / unpause()
```

### ReciclaICO

```solidity
// Principales funciones
function startICO(uint256 duration)
function buyTokens() payable
function finalizeICO()
function claimRefund()
function withdrawFunds()
```

## Tests

```bash
npm run test
```

Los tests verifican:

- Deployment correcto de contratos
- Sistema de roles
- Acuñación y quema de tokens
- Whitelist
- Compra de tokens en ICO
- Canje de recompensas

## Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Contacto

ReciclaUPAO Team - Universidad Privada Antenor Orrego

---

**Disclaimer**: Este proyecto es académico y de investigación. No constituye asesoría financiera ni legal.

---

## 📁 Resumen de Estructura Final
```

recicla-upao-ico/
├── contracts/
│   ├── ReciclaToken.sol ✅
│   └── ReciclaICO.sol ✅
├── scripts/
│   ├── _config.ts ✅
│   ├── deploy.ts ✅
│   ├── setup-initial.ts ✅
│   ├── token-info.ts ✅
│   ├── balances.ts ✅
│   ├── buy-tokens.ts ✅
│   ├── recycle-activity.ts ✅
│   ├── redeem-reward.ts ✅
│   ├── events-live.ts ✅
│   ├── events-history.ts ✅
│   └── finalize-ico.ts ✅
├── ignition/modules/
│   └── ReciclaModule.ts ✅
├── .env.example ✅
├── .gitignore ✅
├── hardhat.config.ts ✅
├── package.json ✅
├── tsconfig.json ✅
├── README.md ✅
└── LICENSE ✅
