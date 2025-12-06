# ReciclaUPAO - Sistema de Incentivos Tokenizado

Sistema de incentivos de reciclaje universitario basado en blockchain. Token REC (ReciclaToken) implementado como ERC-20 en Polygon.

## Descripción del Proyecto

ReciclaUPAO es un **sistema de incentivos tokenizado** para la comunidad universitaria que utiliza tecnología blockchain para garantizar transparencia y trazabilidad en la gestión de recompensas. El sistema permite a los estudiantes ganar tokens REC por actividades de reciclaje verificadas y canjearlos por recompensas en el ecosistema universitario.

**Importante:** Este **NO es una ICO** (Oferta Inicial de Moneda). Los tokens REC se distribuyen exclusivamente como **recompensas** por actividades de reciclaje verificadas, no se venden al público.

## Características Principales

- Token ERC-20 con supply máximo de 10,000,000 REC
- Sistema de whitelist con vinculación a DNI para identidad verificada
- Acuñación controlada por actividades de reciclaje verificadas por backend
- Sistema de roles basado en AccessControl de OpenZeppelin
- Quema de tokens para canje de recompensas
- Sistema de pausa de emergencia
- Tracking completo de tokens ganados y gastados por usuario
- Transparencia y no manipulabilidad gracias a blockchain

## Arquitectura del Sistema

### Smart Contract

**ReciclaToken.sol**

- Hereda de ERC20, AccessControl, Pausable
- Roles: MINTER_ROLE, BURNER_ROLE, PAUSER_ROLE, WHITELIST_MANAGER_ROLE
- Funciones principales: 
  - `mintForActivity()`: Acuña tokens por actividades de reciclaje
  - `burnForRedemption()`: Quema tokens al canjear recompensas
  - `addToWhitelist()`: Agrega usuarios verificados con DNI
- Eventos: TokensMinted, TokensBurned, UserWhitelisted

### Estructura de Directorios

```
recicla-upao-token/
├── contracts/
│   └── ReciclaToken.sol
├── scripts/
│   ├── _config.ts
│   ├── deploy.ts
│   ├── setup-initial.ts
│   ├── token-info.ts
│   ├── balances.ts
│   ├── recycle-activity.ts
│   ├── redeem-reward.ts
│   ├── events-live.ts
│   └── events-history.ts
├── test/
│   └── ReciclaSystem.test.ts
├── deployments/
└── ignition/modules/
```

## Requisitos Previos

- Node.js v18 o superior
- npm o yarn
- Git

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/recicla-upao-token.git
cd recicla-upao-token
```

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### 3. Compilar contratos

```bash
npm run compile
```

El comando generará los artifacts en la carpeta `/artifacts` y los tipos en `/typechain-types`.

## Guía de Uso - Desarrollo Local

### Paso 1: Iniciar red local de Hardhat

Abre una terminal y ejecuta:

```bash
npm run node
```

Este comando iniciará una blockchain local en `http://127.0.0.1:8545` con 20 cuentas de prueba, cada una con 10,000 ETH.

**Importante:** Deja esta terminal corriendo durante todo el proceso de desarrollo.

### Paso 2: Desplegar contratos

Abre una segunda terminal y ejecuta:

```bash
npm run deploy:local
```

Este comando desplegará el contrato ReciclaToken en la red local. La dirección del contrato se guardará automáticamente en `deployments/localhost.json`.

Salida esperada:

- Dirección del ReciclaToken
- Confirmación de deployment exitoso

### Paso 3: Configurar el sistema

En la misma segunda terminal, ejecuta:

```bash
npm run setup
```

Este script realizará las siguientes acciones:

1. Agregar usuarios a la whitelist (admin + 3 usuarios demo)
2. Acuñar 1,000 REC de prueba para el usuario 1
3. Verificar la configuración completa

### Paso 4: Consultar información del sistema

Para ver el estado completo del sistema, ejecuta:

```bash
npm run info
```

Este comando mostrará:

- Información de la red
- Dirección del contrato
- Detalles del token (nombre, símbolo, supply)
- Tokens acuñados y disponibles

### Paso 5: Ver balances de usuarios

```bash
npm run balances
```

Muestra los balances de:

- Administrador
- Backend
- Usuarios demo (1-4)
- Resumen del supply total

### Paso 6: Simular actividad de reciclaje

Para simular que un usuario registra una actividad de reciclaje:

```bash
npm run recycle
```

Por defecto, registra 50 REC para el Usuario #1. Para cambiar la cantidad y el usuario:

```bash
npm run recycle 100 2
```

Esto registrará 100 REC para el Usuario #2.

### Paso 7: Simular canje de recompensa

Para simular que un usuario canjea tokens por una recompensa:

```bash
npm run redeem
```

Por defecto, canjea 25 REC del Usuario #1. Para especificar cantidad y usuario:

```bash
npm run redeem 50 1
```

### Paso 8: Monitorear eventos en vivo (Opcional)

Abre una tercera terminal y ejecuta:

```bash
npm run events:live
```

Este script monitoreará en tiempo real todos los eventos que ocurran en el contrato:

- TokensMinted
- TokensBurned
- Transfer
- UserWhitelisted

Presiona Ctrl+C para detener el monitor.

### Paso 9: Consultar eventos históricos (Opcional)

Para ver todos los eventos desde el inicio:

```bash
npm run events:history
```

Para especificar un rango de bloques:

```bash
npm run events:history 0 100
```

## Testing

### Ejecutar tests unitarios

```bash
npm test
```

El test unitario incluido verifica el flujo completo de un usuario:

1. Registro en la whitelist
2. Acuñación de tokens por actividad de reciclaje
3. Canje de recompensa
4. Verificación de balances y tracking

## Distribución de Tokens

| Asignación | Tokens | Porcentaje | Propósito |
|------------|--------|------------|-----------|
| Recompensas estudiantes | 10,000,000 REC | 100% | Acuñación dinámica por actividades de reciclaje verificadas |

**Nota:** El supply máximo es de 10,000,000 REC y se acuñarán tokens dinámicamente a medida que los estudiantes realicen actividades de reciclaje verificadas. No existe venta de tokens al público.

## Sistema de Roles

### ReciclaToken

- **DEFAULT_ADMIN_ROLE**: Administrador principal, puede otorgar y revocar roles
- **MINTER_ROLE**: Puede acuñar tokens (asignado al backend)
- **BURNER_ROLE**: Puede quemar tokens (asignado al backend)
- **PAUSER_ROLE**: Puede pausar el contrato en emergencias
- **WHITELIST_MANAGER_ROLE**: Gestiona la whitelist de usuarios

## Despliegue en Testnet (Polygon Amoy)

### Configuración de Variables de Entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tu información:

```
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=0xtu_clave_privada_de_metamask
```

### Obtener MATIC de Testnet

Visita el faucet de Polygon: <https://faucet.polygon.technology/>

Ingresa tu dirección de wallet y solicita MATIC gratis.

### Desplegar en Amoy

```bash
npm run deploy:amoy
```

## Scripts Disponibles

### Desarrollo

- `npm run compile` - Compila los contratos Solidity
- `npm run clean` - Limpia artifacts y cache
- `npm test` - Ejecuta los tests unitarios
- `npm run node` - Inicia red local de Hardhat

### Deployment y Configuración

- `npm run deploy:local` - Despliega contratos en red local
- `npm run setup` - Configura el sistema después del deployment

### Consultas

- `npm run info` - Muestra información completa del sistema
- `npm run balances` - Muestra balances de todos los actores
- `npm run events:history` - Muestra eventos históricos
- `npm run events:live` - Monitorea eventos en tiempo real

### Interacciones

- `npm run recycle [cantidad] [usuario]` - Simula actividad de reciclaje
- `npm run redeem [cantidad] [usuario]` - Simula canje de recompensa

## Flujo de Actividad

### 1. Usuario Registra Actividad de Reciclaje

1. Usuario entrega materiales reciclables en punto de acopio
2. Personal verifica y pesa materiales
3. Backend registra actividad y calcula tokens a otorgar
4. Backend llama a `mintForActivity()` en el smart contract
5. Tokens se acreditan a la wallet del usuario

### 2. Usuario Canjea Recompensa

1. Usuario selecciona recompensa en tienda virtual
2. Sistema verifica que usuario tenga suficientes tokens
3. Backend llama a `burnForRedemption()` en el smart contract
4. Tokens se queman y recompensa se marca como entregada

## Seguridad

### Consideraciones Importantes

- Nunca compartas tu clave privada
- Nunca subas el archivo `.env` a repositorios públicos
- Usa wallets separadas para testing y producción
- Las cuentas de Hardhat son públicas, nunca uses sus claves en mainnet
- Realiza auditorías de seguridad antes de desplegar en producción

### Buenas Prácticas

- Mantén actualizadas las dependencias de OpenZeppelin
- Ejecuta tests exhaustivos antes de cada deployment
- Utiliza un multisig wallet para funciones administrativas en producción
- Implementa rate limiting en el backend para prevenir abuso
- Mantén logs detallados de todas las transacciones

## Resolución de Problemas

### Error: Cannot find module

Solución: Ejecuta `npm install --legacy-peer-deps`

### Error: Contratos no encontrados

Solución: Asegúrate de haber ejecutado `npm run compile` primero

### Error: Network not found

Solución: Verifica que el nodo local esté corriendo con `npm run node`

### Error: Insufficient funds

Solución: En testnet, obtén más MATIC del faucet. En local, reinicia el nodo.

## Integración con Backend

El backend de Spring Boot debe:

1. Mantener una wallet con rol MINTER_ROLE y BURNER_ROLE
2. Agregar usuarios a la whitelist con hash de DNI
3. Llamar a `mintForActivity()` cuando se verifiquen actividades
4. Llamar a `burnForRedemption()` cuando se canjeen recompensas
5. Escuchar eventos del contrato para sincronización

## Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## Contacto

ReciclaUPAO Team - recicla@upao.edu.pe

Proyecto académico desarrollado como parte de la tesis de Ingeniería de Sistemas.

---

**Nota:** Este proyecto es un sistema de incentivos tokenizado, NO una ICO. Los tokens solo se distribuyen como recompensas por actividades de reciclaje verificadas.
4. Push a la rama
5. Abre un Pull Request

## Contacto

ReciclaUPAO Team - Universidad Privada Antenor Orrego

Proyecto académico desarrollado como parte de la tesis de Ingeniería de Sistemas.

## Disclaimer

Este proyecto es académico y de investigación. No constituye asesoría financiera ni legal. El uso de este código en producción requiere auditorías de seguridad profesionales.
