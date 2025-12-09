# 🔗 ReciclaUPAO - Blockchain Module

Sistema de smart contracts en Solidity para la tokenización de actividades de reciclaje.

**🌐 Red Actual:** Sepolia Testnet  
**📍 Contrato Desplegado:** `0x6Ee68256eF29096e8Bc66c14494E5f58650488DD`  
**🔍 Etherscan:** https://sepolia.etherscan.io/address/0x6Ee68256eF29096e8Bc66c14494E5f58650488DD

---

## 📋 Prerequisitos

- **Node.js:** v18 o superior
- **npm:** Incluido con Node.js
- **SepoliaETH:** Para desplegar y transaccionar en testnet (obtener en https://sepoliafaucet.com/)

---

## ⚙️ Instalación

```bash
npm install
```

---

## 🚀 Uso

### Desarrollo Local (Hardhat)

#### 1. Compilar Contrato

```bash
npx hardhat compile
```

#### 2. Iniciar Nodo Local (Dejar corriendo en terminal dedicada)

```bash
npx hardhat node
```

> ⚠️ **IMPORTANTE:** Esta terminal debe quedar abierta todo el tiempo.
> 
> Genera automáticamente 20 cuentas con el mnemonic determinista:
> ```
> "test test test test test test test test test test test junk"
> ```

#### 3. Desplegar Contrato (En otra terminal)

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Salida esperada:**
```
✅ ReciclaToken desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

> 📝 Esta dirección es **determinista** - siempre será la misma.

---

### Producción (Sepolia Testnet)

#### 1. Configurar Variables de Entorno

Crea/edita el archivo `.env`:

```env
# RPC URL de Alchemy (gratis)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY

# Private key de la wallet que desplegará (CON SepoliaETH)
PRIVATE_KEY=tu_private_key_aqui
```

> ⚠️ **NUNCA subas `.env` a GitHub**

#### 2. Compilar Contrato

```bash
npx hardhat compile
```

#### 3. Desplegar en Sepolia

```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

**Salida esperada:**
```
✅ ReciclaToken desplegado en: 0x6Ee68256eF29096e8Bc66c14494E5f58650488DD
💾 Deployment info guardada en: deployments/sepolia.json
```

#### 4. Configurar Roles

```bash
npx hardhat run scripts/setup-roles-sepolia.ts --network sepolia
```

**Esto otorga:**
- ✅ VALIDATOR_ROLE
- ✅ PROPOSER_ROLE
- ✅ BURNER_ROLE
- ✅ WHITELIST_MANAGER_ROLE

---

## 🔑 Cuentas

### Desarrollo Local (Hardhat)

| Account | Dirección | Rol | Uso |
|---------|-----------|-----|-----|
| #0 | `0xf39Fd...92266` | Admin/Deployer | Despliega contrato |
| #1 | `0x70997...c79C8` | Backend | Minter/Burner/Proposer |
| #2 | `0x3C44C...dD2b48` | ONG1 | Validador |
| #3 | `0x90F79...6dB9` | ONG2 | Validador |
| #4 | `0x15d34...2C6A65` | Centro Acopio | Proposer |

> Ver archivo `ACCOUNTS.md` para private keys completas.

### Sepolia Testnet

| Wallet | Rol | Configuración |
|--------|-----|---------------|
| `0x7386e0...cBCd` | Admin, Backend, Validador | Configurado en `application.properties` |

> Para producción: crear wallets separadas para cada rol.

---

## 📝 Scripts Útiles

### Desarrollo Local

```bash
# Ver información del token
npx hardhat run scripts/token-info.ts --network localhost

# Ver balances de todas las cuentas
npx hardhat run scripts/balances.ts --network localhost

# Ver historial de eventos
npx hardhat run scripts/events-history.ts --network localhost
```

### Sepolia Testnet

```bash
# Verificar balance de una wallet
npx hardhat console --network sepolia
> const token = await ethers.getContractAt("ReciclaToken", "0x6Ee68256eF29096e8Bc66c14494E5f58650488DD");
> const balance = await token.balanceOf("0xTU_WALLET");
> console.log(ethers.formatEther(balance), "REC");

# Verificar contrato en Etherscan
# https://sepolia.etherscan.io/address/0x6Ee68256eF29096e8Bc66c14494E5f58650488DD
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
│   └── ReciclaToken.sol              # Smart contract ERC-20
├── scripts/
│   ├── deploy.ts                     # Despliegue local (Hardhat)
│   ├── deploy-sepolia.ts             # Despliegue en Sepolia
│   ├── setup-roles-sepolia.ts        # Configurar roles en Sepolia
│   ├── balances.ts                   # Ver balances
│   ├── token-info.ts                 # Info del token
│   └── events-history.ts             # Historial de eventos
├── deployments/
│   ├── localhost.json                # Contrato local
│   └── sepolia.json                  # Contrato Sepolia
├── hardhat.config.ts                 # Configuración de Hardhat
├── .env                              # Variables de entorno (Sepolia)
├── README.md                         # Este archivo
├── SETUP.md                          # Guía de configuración inicial
└── SEPOLIA_SETUP.md                  # Guía de migración a Sepolia
```

---

## 🔧 Configuración

### Hardhat Config (`hardhat.config.ts`)

**Redes disponibles:**

| Red | Chain ID | RPC URL | Uso |
|-----|----------|---------|-----|
| hardhat | 31337 | local | Testing automático |
| localhost | 31337 | http://127.0.0.1:8545 | Desarrollo local |
| sepolia | 11155111 | Alchemy/Infura | Testnet público |

### Variables de Entorno (`.env`)

**Solo necesarias para Sepolia:**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
```

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

### ❌ Error: "Headers Timeout Error" (Sepolia)

**Causa:** RPC público saturado o bloqueado.

**Solución:**
```bash
# Usa Alchemy o Infura en .env:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
```

### ❌ Error: "insufficient funds for gas"

**Solución:**
```bash
# Obtén SepoliaETH gratis:
# https://sepoliafaucet.com/
# https://www.infura.io/faucet/sepolia
# https://faucet.quicknode.com/ethereum/sepolia
```

### ❌ Cambió la dirección del contrato (localhost)

**Causa:** Reiniciaste hardhat node sin volver a desplegar.

**Solución:**
```bash
# Redespliega el contrato
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 📚 Tecnologías

- **Solidity:** 0.8.28
- **Hardhat:** Framework de desarrollo
- **OpenZeppelin:** Librerías de contratos (ERC20, AccessControl, Pausable)
- **Ethers.js:** v6 - Interacción con blockchain
- **TypeScript:** Para scripts
- **Sepolia:** Ethereum Testnet

---

## 🔐 Seguridad

### Desarrollo Local
> ⚠️ **IMPORTANTE:** Usa configuración de **DESARROLLO ÚNICAMENTE**

**NO usar en producción:**
- Mnemonic hardcodeado en `hardhat.config.ts`
- Cuentas con saldos públicos
- Sin protección de private keys

### Sepolia Testnet
> ⚠️ **SepoliaETH NO tiene valor real**, pero sigue buenas prácticas:

**Recomendaciones:**
- ✅ Usa `.gitignore` para `.env`
- ✅ No compartas tu PRIVATE_KEY
- ✅ Crea wallets separadas por rol
- ✅ No reutilices wallets de mainnet

### Producción (Mainnet)
**Para producción:**
1. Usa variables de entorno seguras
2. Nunca expongas private keys
3. Usa hardware wallets para deployer
4. Implementa multisig para admin
5. Auditoría de seguridad del smart contract

---

## ✅ Checklist de Configuración

### Desarrollo Local
- [ ] Node.js instalado (v18+)
- [ ] `npm install` ejecutado
- [ ] Contrato compilado (`npx hardhat compile`)
- [ ] Hardhat node corriendo en terminal dedicada
- [ ] Contrato desplegado en `0x5FbDB...180aa3`
- [ ] Scripts de balances funcionando

### Sepolia Testnet
- [ ] Wallet con SepoliaETH (mínimo 0.1 ETH)
- [ ] Archivo `.env` configurado con PRIVATE_KEY y RPC
- [ ] Contrato compilado
- [ ] Contrato desplegado en Sepolia
- [ ] Roles configurados (`setup-roles-sepolia.ts`)
- [ ] Backend actualizado en `application.properties`
- [ ] Verificado en Sepolia Etherscan

---

## 📖 Documentación Adicional

- **Desarrollo:** `DEVELOPMENT_GUIDE.md` - Guía completa de desarrollo
- **Setup Inicial:** `SETUP.md` - Configuración paso a paso
- **Migración Sepolia:** `SEPOLIA_SETUP.md` - Deploy en testnet
- **Cuentas:** `ACCOUNTS.md` - Private keys de desarrollo
- **Contrato:** `contracts/ReciclaToken.sol` - Código comentado

---

## 🌐 Redes Configuradas

### Desarrollo Local
**Network:** Hardhat Local (localhost)  
**RPC:** http://127.0.0.1:8545  
**Chain ID:** 31337  
**Contrato:** 0x5FbDB2315678afecb367f032d93F642f64180aa3 (determinista)

### Testnet Público
**Network:** Sepolia Testnet  
**RPC:** https://eth-sepolia.g.alchemy.com/v2/VQ_jKkFIWE-kn56xsm1Is  
**Chain ID:** 11155111  
**Contrato:** 0x6Ee68256eF29096e8Bc66c14494E5f58650488DD  
**Explorer:** https://sepolia.etherscan.io/

---

## 🎯 Próximos Pasos

1. ✅ **Desarrollo completado** - Funciona en localhost
2. ✅ **Testnet desplegado** - Funciona en Sepolia
3. ⏳ **Producción VPS** - Deploy del backend en servidor
4. ⏳ **Mainnet** - Despliegue en Ethereum Mainnet (requiere auditoría)

---

**Autor:** JhoneiroLove  
**Licencia:** MIT  
**Repositorio:** https://github.com/JhoneiroLove/ReciclaTokenUpao
