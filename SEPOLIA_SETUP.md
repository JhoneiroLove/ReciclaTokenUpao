# Guía de Migración a Sepolia Testnet

## 📋 Requisitos Previos

1. **Cuenta de MetaMask** con SepoliaETH
2. **Private Key** de la cuenta que desplegará el contrato
3. **3 cuentas adicionales** para roles (Backend, ONG1, ONG2)

---

## 🪙 Obtener SepoliaETH

Necesitarás SepoliaETH en tu wallet para:
- Desplegar el smart contract (~0.05 ETH)
- Configurar roles iniciales (~0.01 ETH)
- Gas para transacciones (~0.001 ETH por tx)

### Faucets de Sepolia:

1. **Alchemy Faucet** (Recomendado)
   - URL: https://sepoliafaucet.com/
   - Requiere: Cuenta Alchemy (gratis)
   - Cantidad: 0.5 SepoliaETH/día

2. **Infura Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requiere: Cuenta Infura (gratis)
   - Cantidad: 0.5 SepoliaETH/día

3. **QuickNode Faucet**
   - URL: https://faucet.quicknode.com/ethereum/sepolia
   - Requiere: Cuenta QuickNode (gratis)
   - Cantidad: 0.05 SepoliaETH/request

4. **Chainlink Faucet**
   - URL: https://faucets.chain.link/sepolia
   - Requiere: Cuenta GitHub
   - Cantidad: 0.1 SepoliaETH

---

## 🔧 Configuración

### 1. Configurar .env

Edita el archivo `.env` en `recicla-upao-token`:

```env
# Private key de la cuenta deployer (CON SepoliaETH)
PRIVATE_KEY=0xTU_PRIVATE_KEY_AQUI

# RPC URL (público o de Alchemy/Infura)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a GitHub

### 2. Verificar configuración

```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia --dry-run
```

---

## 🚀 Despliegue

### Paso 1: Compilar contratos

```bash
cd recicla-upao-token
npx hardhat compile
```

### Paso 2: Desplegar en Sepolia

```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

Esto desplegará el contrato y guardará la dirección en `deployments/sepolia.json`.

### Paso 3: Configurar roles iniciales

Necesitarás 3 wallets adicionales (Backend, ONG1, ONG2) con un poco de SepoliaETH para pagar gas.

Edita `scripts/setup-initial.ts` con las addresses de tus wallets y ejecuta:

```bash
npx hardhat run scripts/setup-initial.ts --network sepolia
```

---

## ⚙️ Configurar Backend

Actualiza `application.properties`:

```properties
# ==================== BLOCKCHAIN CONFIGURATION ====================
blockchain.enabled=true
blockchain.network=sepolia
blockchain.rpc-url=https://rpc.sepolia.org
blockchain.chain-id=11155111

# Dirección del contrato desplegado (obtener de deployments/sepolia.json)
blockchain.token-address=0xDIRECCION_DE_TU_CONTRATO

# ==================== BACKEND WALLET ====================
# Private key del backend (debe tener rol PROPOSER_ROLE)
blockchain.backend-private-key=0xPRIVATE_KEY_BACKEND

# ==================== VALIDADORES (ONGs) ====================
validator1.wallet=0xWALLET_ONG1
validator1.private-key=0xPRIVATE_KEY_ONG1

validator2.wallet=0xWALLET_ONG2
validator2.private-key=0xPRIVATE_KEY_ONG2
```

---

## 📱 Configurar Frontend (Angular)

Si tienes configuración de red en el frontend, actualiza:

```typescript
export const environment = {
  production: false,
  blockchain: {
    network: 'sepolia',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    tokenAddress: '0xDIRECCION_DE_TU_CONTRATO'
  }
};
```

---

## 🔍 Verificación

### Ver contrato en Etherscan

```
https://sepolia.etherscan.io/address/0xTU_CONTRATO_ADDRESS
```

### Verificar balance de token

```bash
npx hardhat console --network sepolia
```

```javascript
const token = await ethers.getContractAt("ReciclaToken", "0xTU_CONTRATO_ADDRESS");
const balance = await token.balanceOf("0xTU_WALLET");
console.log(ethers.formatEther(balance), "RTK");
```

---

## 📊 Estructura de Cuentas Recomendada

| Rol | Descripción | SepoliaETH Necesario |
|-----|-------------|---------------------|
| Deployer | Despliega contrato y asigna roles | 0.1 ETH |
| Backend | Rol PROPOSER_ROLE y BURNER_ROLE | 0.05 ETH |
| ONG 1 | Rol VALIDATOR_ROLE | 0.02 ETH |
| ONG 2 | Rol VALIDATOR_ROLE | 0.02 ETH |
| Centro Acopio | Rol WHITELIST_MANAGER_ROLE | 0.02 ETH |
| Estudiantes | Sin rol en contrato (solo reciben tokens) | 0 ETH |

**Total recomendado**: ~0.25 SepoliaETH

---

## 🛠️ Troubleshooting

### Error: "insufficient funds for gas"
- Necesitas más SepoliaETH en la cuenta que está ejecutando la transacción
- Usa los faucets mencionados arriba

### Error: "nonce too high"
- Reinicia MetaMask: Settings → Advanced → Clear Activity Tab Data

### Error: "network does not support ENS"
- Normal en Sepolia, ignora este warning

### Transacción pendiente por mucho tiempo
- Sepolia puede ser lento, espera 2-5 minutos
- Verifica en: https://sepolia.etherscan.io/

---

## 📚 Recursos

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Sepolia Faucet (Alchemy)**: https://sepoliafaucet.com/
- **Documentación Hardhat**: https://hardhat.org/hardhat-runner/docs/guides/deploying
- **MetaMask - Agregar Sepolia**: https://chainlist.org/?search=sepolia

---

## 🔐 Seguridad

⚠️ **NUNCA compartas tu PRIVATE_KEY**
⚠️ **Agrega `.env` a `.gitignore`**
⚠️ **Usa wallets diferentes para testnet y mainnet**
⚠️ **No reutilices private keys de producción en testnet**

---

## ✅ Checklist de Migración

- [ ] Obtener SepoliaETH en 4 cuentas (Deployer, Backend, ONG1, ONG2)
- [ ] Configurar `.env` con PRIVATE_KEY y SEPOLIA_RPC_URL
- [ ] Compilar contratos: `npx hardhat compile`
- [ ] Desplegar contrato: `npx hardhat run scripts/deploy-sepolia.ts --network sepolia`
- [ ] Guardar dirección del contrato de `deployments/sepolia.json`
- [ ] Configurar roles: `npx hardhat run scripts/setup-initial.ts --network sepolia`
- [ ] Actualizar `application.properties` del backend
- [ ] Actualizar configuración del frontend (si aplica)
- [ ] Reiniciar backend: `mvn spring-boot:run`
- [ ] Probar flujo completo: Registro → Aprobación → Mint de tokens
- [ ] Verificar en Sepolia Etherscan
