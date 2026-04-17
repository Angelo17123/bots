# Bot de Verificación Staff - Discord.js

Bot de verificación del staff para Discord, creado con Node.js y discord.js v14.

## 🚀 Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura el token en `bot.js`:
```javascript
const TOKEN = 'TU_TOKEN_AQUI';
```

3. Ejecuta el bot:
```bash
npm start
```
O simplemente:
```bash
node bot.js
```

## 📋 Comandos

- `/panel` - Abre el sistema de verificación

## 🔐 Flujo de Verificación

1. Usuario con rol ADM ejecuta `/panel`
2. Ve el mensaje de bienvenida con botón "Verificarse"
3. Hace clic en "Verificarse"
4. Completa el formulario:
   - **Nombre IC** (sin apellidos)
   - **ID IC**
5. Selecciona su rango del dropdown:
   - Responsable
   - ADM
   - Aux
   - Lid
   - Sub
   - Miembro
   - Tester
6. La solicitud se envía al autorizador (ID: 1494810053000167645)
7. El autorizador recibe la solicitud con botones:
   - ✅ **Aceptar**
   - ❌ **Rechazar**
8. Ambas partes reciben notificación del resultado

## ⚙️ Configuración

Edita las constantes al inicio de `bot.js`:

```javascript
const TOKEN = 'TU_TOKEN_DISCORD';
const AUTHORIZER_ID = '1494810053000167645';
const ADM_ROLE_ID = '1494805272915480707';
```

## 📦 Dependencias

- `discord.js`: ^14.14.0
- `dotenv`: ^16.3.1

## 🎯 Características

- Sistema de verificación completo
- Selección de rango desde archivo
- Notificaciones automáticas
- Panel decontrol con botones de aceptar/rechazar
- Mensajes embebidos con formato profesional
- Fechas en español

## 📝 Estructura de Roles (desde Roles.txt)

- Responsable: 1494805401357652000
- ADM: 1494805272915480707
- Aux: 1494805184180916425
- Lid: 1494805094393188542
- Sub: 1494805042685804574
- Miembro: 1494804959588519957
- Tester: 1494804831758582013

---
¡Disfruta usando el bot!