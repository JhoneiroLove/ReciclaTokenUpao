# 🔗 ReciclaUPAO - Blockchain Module

Sistema de smart contracts en Solidity para la tokenización de actividades de reciclaje.

---

## 📋 Prerequisitos

- **Node.js:** v18 o superior
- **npm:** Incluido con Node.js

---

## ⚙️ Instalación

```bash
npm install
```

---

## 🚀 Uso

### 1. Compilar Contrato

```bash
npx hardhat compile
```

### 2. Iniciar Nodo Local (Dejar corriendo en terminal dedicada)

```bash
npx hardhat node
```

> ⚠️ **IMPORTANTE:** Esta terminal debe quedar abierta todo el tiempo.
> 
> Genera automáticamente 20 cuentas con el mnemonic determinista:
> ```
> "test test test test test test test test test test test junk"
> ```

### 3. Desplegar Contrato (En otra terminal)

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Salida esperada:**
```
✅ ReciclaToken desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

> 📝 Esta dirección es **determinista** - siempre será la misma.

### 4. Asignar Roles

```bash
# Roles al Backend (Account #1)
npx hardhat run scripts/grant-backend-roles.ts --network localhost

# Roles a ONGs (Accounts #2 y #3)
npx hardhat run scripts/grant-ong-roles.ts --network localhost

# Rol a Centro de Acopio (Account #4)
npx hardhat run scripts/grant-centro-role.ts --network localhost
```

---

## 🔑 Cuentas Hardhat (Deterministas)

| Account | Dirección | Rol | Uso |
|---------|-----------|-----|-----|
| #0 | `0xf39Fd...92266` | Admin/Deployer | Despliega contrato |
| #1 | `0x70997...c79C8` | Backend | Minter/Burner/Proposer |
| #2 | `0x3C44C...dD2b48` | ONG1 | Validador |
| #3 | `0x90F79...6dB9` | ONG2 | Validador |
| #4 | `0x15d34...2C6A65` | Centro Acopio | Proposer |

> Ver archivo `ACCOUNTS.md` para private keys y detalles completos.

---

## 📝 Scripts Útiles

### Ver Información del Token

```bash
npx hardhat run scripts/token-info.ts --network localhost
```

### Ver Balances de Todas las Cuentas

```bash
npx hardhat run scripts/balances.ts --network localhost
```

### Ver Historial de Eventos

```bash
npx hardhat run scripts/events-history.ts --network localhost
```

### Limpiar Cache

```bash
npx hardhat clean
```

---

## 🏗️ Estructura del Proyecto

```
recicla-upao-token/
├── contracts/
│   └── ReciclaToken.sol          # Smart contract ERC-20
├── scripts/
│   ├── deploy.ts                 # Despliegue del contrato
│   ├── grant-backend-roles.ts    # Roles al backend
│   ├── grant-ong-roles.ts        # Roles a ONGs
│   ├── grant-centro-role.ts      # Rol a Centro
│   ├── balances.ts               # Ver balances
│   ├── token-info.ts             # Info del token
│   └── events-history.ts         # Historial de eventos
├── deployments/
│   └── localhost.json            # Dirección del contrato desplegado
├── hardhat.config.ts             # Configuración de Hardhat
└── .env                          # Variables de entorno (solo para testnet/mainnet)
```

---

## 🔧 Configuración

### Hardhat Config (`hardhat.config.ts`)

- **Mnemonic determinista:** Siempre genera las mismas 20 cuentas
- **Chainid:** 31337 (Hardhat Local)
- **Saldo inicial:** 10,000 ETH por cuenta

### Variables de Entorno (`.env`)

**Solo necesarias para desplegar en testnet/mainnet:**
- `POLYGON_RPC_URL` - RPC de Polygon Mainnet
- `MUMBAI_RPC_URL` - RPC de Polygon Amoy Testnet
- `PRIVATE_KEY` - Private key del deployer
- `POLYGONSCAN_API_KEY` - API key para verificación

> ⚠️ Para **localhost** NO se necesita `.env`

---

## 🛠️ Troubleshooting

### ❌ Error: "Cannot connect to hardhat node"

**Solución:**
```bash
# Verifica que hardhat node esté corriendo
# En una terminal dedicada:
npx hardhat node
```

### ❌ Error: "Contract not found"

**Solución:**
```bash
# Limpia cache y redespliega
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

### ❌ Cambió la dirección del contrato

**Causa:** Reiniciaste hardhat node sin volver a desplegar.

**Solución:**
```bash
# Redespliega el contrato
npx hardhat run scripts/deploy.ts --network localhost

# Reasigna roles
npx hardhat run scripts/grant-backend-roles.ts --network localhost
npx hardhat run scripts/grant-ong-roles.ts --network localhost
npx hardhat run scripts/grant-centro-role.ts --network localhost
```

---

## 📚 Tecnologías

- **Solidity:** 0.8.28
- **Hardhat:** Framework de desarrollo
- **OpenZeppelin:** Librerías de contratos (ERC20, AccessControl, Pausable)
- **Ethers.js:** v6 - Interacción con blockchain
- **TypeScript:** Para scripts

---

## 🔐 Seguridad

> ⚠️ **IMPORTANTE:** Este proyecto usa configuración de **DESARROLLO**

**NO usar en producción:**
- Mnemonic hardcodeado en `hardhat.config.ts`
- Cuentas con saldos públicos
- Sin protección de private keys

**Para producción:**
1. Usa variables de entorno seguras
2. Nunca expongas private keys
3. Usa hardware wallets para deployer
4. Implementa multisig para admin

---

## ✅ Checklist de Configuración

- [ ] Node.js instalado (v18+)
- [ ] `npm install` ejecutado
- [ ] Contrato compilado (`npx hardhat compile`)
- [ ] Hardhat node corriendo en terminal dedicada
- [ ] Contrato desplegado en `0x5FbDB...180aa3`
- [ ] Roles asignados (backend, ONGs, centro)
- [ ] Scripts de balances funcionando

---

## 📖 Documentación Adicional

- **Desarrollo:** `DEVELOPMENT_GUIDE.md`
- **Cuentas:** `ACCOUNTS.md`
- **Contrato:** `contracts/ReciclaToken.sol` (comentado)

---

**Network:** Hardhat Local (localhost)  
**RPC:** http://127.0.0.1:8545  
**Chain ID:** 31337  
**Contrato:** 0x5FbDB2315678afecb367f032d93F642f64180aa3 (determinista)
