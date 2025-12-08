# 🔑 Cuentas Hardhat - Sistema ReciclaUPAO

## Mnemonic
```
test test test test test test test test test test test junk
```

---

## 📋 Cuentas Generadas (Siempre las mismas)

### Account #0 - Admin/Deployer 👑
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Rol:** DEFAULT_ADMIN_ROLE en smart contract
- **Uso:** Desplegar contratos, administrador del sistema
- **Balance:** 10,000 ETH

---

### Account #1 - Backend Service 🔧
- **Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Private Key:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Roles:** PROPOSER_ROLE, WHITELIST_MANAGER_ROLE, BURNER_ROLE
- **Uso:** Backend API (Spring Boot) - propone actividades, registra usuarios, quema tokens
- **Balance:** 10,000 ETH (debe financiarse con 100 ETH para gas)

---

### Account #2 - Validador ONG 1 ✅
- **Address:** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **Private Key:** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- **Rol:** VALIDATOR_ROLE
- **Uso:** ONG/Centro de Acopio - valida actividades de reciclaje
- **Balance:** 10,000 ETH

---

### Account #3 - Validador ONG 2 ✅
- **Address:** `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- **Private Key:** `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
- **Rol:** VALIDATOR_ROLE
- **Uso:** ONG/Centro de Acopio - valida actividades de reciclaje
- **Balance:** 10,000 ETH

---

### Account #4 - Usuario Demo: María 👤
- **Address:** `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
- **Private Key:** `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
- **Uso:** Usuario reciclador de prueba
- **Balance:** 10,000 ETH

---

### Account #5 - Usuario Demo: Juan 👤
- **Address:** `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc`
- **Private Key:** `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba`
- **Uso:** Usuario reciclador de prueba
- **Balance:** 10,000 ETH

---

### Account #6 - Usuario Demo: Ana 👤
- **Address:** `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
- **Private Key:** `0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e`
- **Uso:** Usuario reciclador de prueba
- **Balance:** 10,000 ETH

---

### Accounts #7-19 - Reservadas
- **Uso:** Disponibles para más usuarios de prueba o roles futuros
- **Balance:** 10,000 ETH cada una

---

## 🎯 Uso en Configuraciones

### Backend (`application.properties`):
```properties
blockchain.backend-private-key=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
validator1.wallet=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
validator2.wallet=0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### MetaMask (para demos):
- **Admin:** Importar Account #0
- **Validadores:** Importar Account #2 y #3
- **Usuarios:** Importar Account #4, #5, #6

---

## 🔄 Flujo de Inicialización

1. **Iniciar Hardhat Node:** `npm run node`
2. **Desplegar Contrato:** `npm run deploy:local` (siempre en `0x5FbDB2315678afecb367f032d93F642f64180aa3`)
3. **Configurar Roles:** `npm run setup` (asigna VALIDATOR_ROLE a Accounts #2 y #3)
4. **Financiar Backend:** `npm run fund-backend` (transfiere 100 ETH a Account #1)
5. **Asignar Roles Backend:** `npm run grant-roles` (asigna PROPOSER, WHITELIST_MANAGER, BURNER a Account #1)

---