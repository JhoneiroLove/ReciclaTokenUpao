# ReciclaUPAO - ICO & Token ERC-20

Sistema de incentivos de reciclaje universitario basado en blockchain. Token REC (ReciclaToken) implementado como ERC-20 en Polygon.

## Descripción del Proyecto

ReciclaUPAO es un sistema de incentivos de reciclaje para la comunidad universitaria que utiliza tecnología blockchain para garantizar transparencia y trazabilidad en la gestión de recompensas. El sistema permite a los estudiantes ganar tokens REC por actividades de reciclaje verificadas y canjearlos por recompensas en el ecosistema universitario.

## Características Principales

- Token ERC-20 con supply máximo de 10,000,000 REC
- Sistema de whitelist con vinculación a DNI para identidad verificada
- Acuñación controlada por actividades de reciclaje verificadas por backend
- ICO con soft cap (50,000 MATIC) y hard cap (500,000 MATIC)
- Descuentos progresivos por early adopters: 15%, 10%, 5% por semana
- Sistema de roles basado en AccessControl de OpenZeppelin
- Quema de tokens para canje de recompensas
- Sistema de pausa de emergencia
- Tracking completo de tokens ganados y gastados por usuario

## Arquitectura del Sistema

### Smart Contracts

**ReciclaToken.sol**

- Hereda de ERC20, AccessControl, Pausable
- Roles: MINTER_ROLE, BURNER_ROLE, PAUSER_ROLE, WHITELIST_MANAGER_ROLE
- Funciones principales: mintForActivity, burnForRedemption, addToWhitelist
- Eventos: TokensMinted, TokensBurned, UserWhitelisted

**ReciclaICO.sol**

- Hereda de Ownable, ReentrancyGuard, Pausable
- Gestión de soft cap y hard cap
- Sistema de descuentos progresivos por semana
- Funciones principales: startICO, buyTokens, finalizeICO, claimRefund

### Estructura de Directorios

```
recicla-upao-ico/
├── contracts/
│   ├── ReciclaToken.sol
│   └── ReciclaICO.sol
├── scripts/
│   ├── _config.ts
│   ├── deploy.ts
│   ├── setup-initial.ts
│   ├── token-info.ts
│   ├── balances.ts
│   ├── buy-tokens.ts
│   ├── recycle-activity.ts
│   ├── redeem-reward.ts
│   ├── events-live.ts
│   ├── events-history.ts
│   └── finalize-ico.ts
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
git clone https://github.com/tu-usuario/recicla-upao-ico.git
cd recicla-upao-ico
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

Este comando desplegará los contratos ReciclaToken y ReciclaICO en la red local. Las direcciones de los contratos se guardarán automáticamente en `deployments/localhost.json`.

Salida esperada:

- Dirección del ReciclaToken
- Dirección del ReciclaICO
- Confirmación de deployment exitoso

### Paso 3: Configurar el sistema

En la misma segunda terminal, ejecuta:

```bash
npm run setup
```

Este script realizará las siguientes acciones:

1. Agregar el administrador a la whitelist
2. Acuñar 3,000,000 REC para la ICO
3. Transferir los tokens al contrato ICO
4. Agregar tres usuarios demo a la whitelist
5. Iniciar la ICO con duración de 30 días
6. Verificar la configuración completa

### Paso 4: Consultar información del sistema

Para ver el estado completo del sistema, ejecuta:

```bash
npm run info
```

Este comando mostrará:

- Información de la red
- Direcciones de los contratos
- Datos del token REC (nombre, símbolo, supply)
- Estado de la ICO (activa/inactiva, precio, descuentos)
- Cronología de la ICO
- Progreso actual (fondos recaudados, tokens vendidos)

### Paso 5: Ver balances de usuarios

```bash
npm run balances
```

Muestra los balances de:

- Administrador
- Backend
- Usuarios demo (1-4)
- Contrato ICO
- Resumen del supply total

### Paso 6: Simular compra de tokens

Para simular que un usuario compra tokens en la ICO:

```bash
npm run buy-tokens
```

Por defecto, el Usuario #1 comprará con 10 MATIC. Para especificar una cantidad diferente:

```bash
npm run buy-tokens 50
```

El script calculará automáticamente el descuento aplicable según la semana de la ICO.

### Paso 7: Simular actividad de reciclaje

Para simular que un usuario registra una actividad de reciclaje:

```bash
npm run recycle
```

Por defecto, registra 50 REC para el Usuario #1. Para cambiar la cantidad y el usuario:

```bash
npm run recycle 100 2
```

Esto registrará 100 REC para el Usuario #2.

### Paso 8: Simular canje de recompensa

Para simular que un usuario canjea tokens por una recompensa:

```bash
npm run redeem
```

Por defecto, canjea 25 REC del Usuario #1. Para especificar cantidad y usuario:

```bash
npm run redeem 50 1
```

### Paso 9: Monitorear eventos en vivo (Opcional)

Abre una tercera terminal y ejecuta:

```bash
npm run events:live
```

Este script monitoreará en tiempo real todos los eventos que ocurran en los contratos:

- TokensMinted
- TokensBurned
- Transfer
- UserWhitelisted
- TokensPurchased
- ICOStarted
- ICOFinalized

Presiona Ctrl+C para detener el monitor.

### Paso 10: Consultar eventos históricos (Opcional)

Para ver todos los eventos desde el inicio:

```bash
npm run events:history
```

Para especificar un rango de bloques:

```bash
npm run events:history 0 100
```

### Paso 11: Finalizar ICO (Cuando termine el período)

Cuando la ICO llegue a su fecha de fin o alcance el hard cap:

```bash
npm run finalize-ico
```

Este script:

- Finalizará la ICO
- Retirará los fondos si se alcanzó el soft cap
- Retirará los tokens no vendidos
- Mostrará el resumen final

## Testing

### Ejecutar tests unitarios

```bash
npm test
```

El test unitario incluido verifica el flujo completo de un usuario:

1. Compra de tokens en la ICO con descuento
2. Registro de actividad de reciclaje
3. Canje de recompensa
4. Verificación de balances y tracking

## Tokenomics

### Distribución de Tokens

| Asignación | Tokens | Porcentaje | Propósito |
|------------|--------|------------|-----------|
| Recompensas estudiantes | 4,000,000 REC | 40% | Acuñación dinámica por actividades |
| ICO Pública | 3,000,000 REC | 30% | Venta pública |
| Equipo | 1,500,000 REC | 15% | Desarrollo |
| Reserva estratégica | 1,000,000 REC | 10% | Marketing y partnerships |
| Liquidez DEX | 500,000 REC | 5% | Pools de liquidez |

### Parámetros de la ICO

- Precio inicial: 0.1 MATIC por REC
- Soft Cap: 50,000 MATIC
- Hard Cap: 500,000 MATIC
- Compra mínima: 100 REC
- Compra máxima: 100,000 REC
- Duración: 30 días
- Descuentos: Semana 1 (15%), Semana 2 (10%), Semana 3 (5%)

## Sistema de Roles

### ReciclaToken

- **DEFAULT_ADMIN_ROLE**: Administrador principal, puede otorgar y revocar roles
- **MINTER_ROLE**: Puede acuñar tokens (asignado al backend)
- **BURNER_ROLE**: Puede quemar tokens (asignado al backend)
- **PAUSER_ROLE**: Puede pausar el contrato en emergencias
- **WHITELIST_MANAGER_ROLE**: Gestiona la whitelist de usuarios

### ReciclaICO

- **Owner**: Administrador de la ICO, puede iniciar, finalizar y retirar fondos

## Despliegue en Testnet (Mumbai)

### Configuración de Variables de Entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tu información:

```
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/TU_API_KEY
PRIVATE_KEY=0xtu_clave_privada_de_metamask
```

### Obtener MATIC de Testnet

Visita el faucet de Polygon: <https://faucet.polygon.technology/>

Ingresa tu dirección de wallet y solicita MATIC gratis.

### Desplegar en Mumbai

```bash
npm run deploy:mumbai
```

Nota: Necesitarás actualizar el script de deployment y la configuración de Hardhat para soportar Mumbai.

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

- `npm run buy-tokens [cantidad]` - Simula compra de tokens
- `npm run recycle [cantidad] [usuario]` - Simula actividad de reciclaje
- `npm run redeem [cantidad] [usuario]` - Simula canje de recompensa
- `npm run finalize-ico` - Finaliza la ICO

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

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Contacto

ReciclaUPAO Team - Universidad Privada Antenor Orrego

Proyecto académico desarrollado como parte de la tesis de Ingeniería de Sistemas.

## Disclaimer

Este proyecto es académico y de investigación. No constituye asesoría financiera ni legal. El uso de este código en producción requiere auditorías de seguridad profesionales.
