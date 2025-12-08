# 🚀 Guía de Configuración Completa - ReciclaUPAO

**Para alguien que nunca ha trabajado con blockchain**

---

## 📌 Orden de Ejecución (IMPORTANTE)

Debes levantar los módulos en este orden exacto:

```
1. BLOCKCHAIN (recicla-upao-token)
2. BACKEND (recicla_upao_nube)
3. FRONTEND (recicla_app_front)
```

> ⚠️ Si no sigues este orden, el sistema NO funcionará.

---

## 🔗 PASO 1: Blockchain (recicla-upao-token)

### Terminal 1 - Nodo Blockchain (Mantener abierta)

```bash
cd recicla-upao-token
npm install
npx hardhat node
```

**Resultado esperado:**
- Verás un listado de 20 cuentas con sus direcciones y private keys
- La terminal se quedará "colgada" mostrando `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`
- **NO cierres esta terminal**

### Terminal 2 - Desplegar Contrato

```bash
cd recicla-upao-token
npx hardhat run scripts/deploy.ts --network localhost
```

**Resultado esperado:**
```
✅ ReciclaToken desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Terminal 2 - Asignar Roles (Misma terminal)

```bash
npx hardhat run scripts/grant-backend-roles.ts --network localhost
npx hardhat run scripts/grant-ong-roles.ts --network localhost
npx hardhat run scripts/grant-centro-role.ts --network localhost
```

**Resultado esperado:**
```
✅ Roles asignados al backend
✅ Roles asignados a ONGs
✅ Rol asignado a Centro de Acopio
```

> ✅ **Blockchain listo** - Mantén la Terminal 1 abierta todo el tiempo

---

## ⚙️ PASO 2: Backend (recicla_upao_nube)

### Prerequisito: Base de Datos MySQL

```bash
mysql -u root -p
```

```sql
CREATE DATABASE recicla_db;
EXIT;
```

### Terminal 3 - Iniciar Backend

```bash
cd recicla_upao_nube
mvnw spring-boot:run
```

O si tienes Maven instalado:

```bash
mvn spring-boot:run
```

**Resultado esperado:**
```
Started ReciclaUpaoNubeApplication in X.XXX seconds
```

**Verifica que esté funcionando:**
- Abre http://localhost:8080 en tu navegador
- Deberías ver una página de Swagger UI o un mensaje de error (es normal)

> ✅ **Backend listo** - Mantén esta terminal abierta

---

## 🎨 PASO 3: Frontend (recicla_app_front)

### Terminal 4 - Iniciar Frontend

```bash
cd recicla_app_front
npm install
ng serve
```

**Resultado esperado:**
```
✔ Compiled successfully
** Angular Live Development Server is listening on localhost:4200
```

**Accede a la aplicación:**
```
http://localhost:4200
```

> ✅ **Frontend listo** - Ya puedes usar la aplicación

---

## 🎯 Verificación Final

Si todo está bien, deberías tener **4 terminales abiertas**:

1. **Terminal 1:** `npx hardhat node` (Blockchain corriendo)
2. **Terminal 2:** Cerrada (ya terminó de asignar roles)
3. **Terminal 3:** `mvnw spring-boot:run` (Backend corriendo)
4. **Terminal 4:** `ng serve` (Frontend corriendo)

### Prueba de Funcionamiento

1. Abre http://localhost:4200
2. Login con: `centroacopio` / `centro123`
3. Si puedes entrar → **TODO FUNCIONA ✅**

---

## ❌ Problemas Comunes

### "Cannot connect to blockchain"

**Causa:** No iniciaste el nodo de Hardhat.

**Solución:**
```bash
cd recicla-upao-token
npx hardhat node
```

### "Connection refused 8080"

**Causa:** Backend no está corriendo.

**Solución:**
```bash
cd recicla_upao_nube
mvnw spring-boot:run
```

### "Cannot GET /"

**Causa:** Frontend no está corriendo.

**Solución:**
```bash
cd recicla_app_front
ng serve
```

### "ERROR 1045: Access denied for user 'root'"

**Causa:** Contraseña incorrecta de MySQL.

**Solución:**
- Edita `recicla_upao_nube/src/main/resources/application.properties`
- Cambia `spring.datasource.password=root` por tu contraseña real

### El frontend no conecta con el backend

**Causa:** URL incorrecta.

**Solución:**
- Edita `recicla_app_front/src/app/service/helper.ts`
- Verifica que diga: `let baserUrl = 'http://localhost:8080'`

---

## 🔄 Para Reiniciar el Sistema

### Si apagas la computadora o cierras las terminales:

1. **Blockchain:**
   ```bash
   cd recicla-upao-token
   npx hardhat node
   ```
   
   **En otra terminal:**
   ```bash
   cd recicla-upao-token
   npx hardhat run scripts/deploy.ts --network localhost
   npx hardhat run scripts/grant-backend-roles.ts --network localhost
   npx hardhat run scripts/grant-ong-roles.ts --network localhost
   npx hardhat run scripts/grant-centro-role.ts --network localhost
   ```

2. **Backend:**
   ```bash
   cd recicla_upao_nube
   mvnw spring-boot:run
   ```

3. **Frontend:**
   ```bash
   cd recicla_app_front
   ng serve
   ```

> ⚠️ **IMPORTANTE:** Cada vez que reinicies Hardhat, debes volver a desplegar el contrato y asignar roles.

---

## 📝 Resumen para Principiantes

**¿Qué es Hardhat?**
- Es un "servidor de blockchain local" para desarrollo
- Similar a tener MySQL corriendo localmente
- Genera cuentas de prueba automáticamente

**¿Por qué mantener la terminal abierta?**
- Hardhat node es como un servidor - si lo cierras, la blockchain deja de funcionar
- El backend necesita conectarse a él constantemente

**¿Qué hacen los scripts de roles?**
- Le dan permisos a las cuentas para interactuar con el smart contract
- Backend = puede crear tokens
- ONGs = pueden validar actividades
- Centro = puede proponer actividades

**¿Puedo usar otro editor en lugar de VS Code?**
- Sí, pero necesitas terminales independientes
- Asegúrate de poder tener 4 terminales abiertas simultáneamente

---

## ✅ Checklist Rápido

Antes de decir "no funciona", verifica:

- [ ] Terminal con `npx hardhat node` está abierta
- [ ] Ves el mensaje `Started HTTP and WebSocket JSON-RPC server`
- [ ] Ejecutaste `deploy.ts` y viste la dirección del contrato
- [ ] Ejecutaste los 3 scripts de `grant-*-roles.ts`
- [ ] MySQL está corriendo y la DB `recicla_db` existe
- [ ] Backend muestra `Started ReciclaUpaoNubeApplication`
- [ ] Frontend muestra `Compiled successfully`
- [ ] Puedes acceder a http://localhost:4200

---

**Si después de esto sigue sin funcionar, revisa los logs de cada terminal para ver errores específicos.**
