# Electron App (macOS signed build)

Este proyecto permite generar un binario para macOS, firmado con el certificado adecuado para distribución.

---

## 1️⃣ Prerrequisitos

Antes de ejecutar nada:

- Tener instalado **Yarn** (NO usar npm)

```bash
brew install yarn
````

- Tener en la raíz del proyecto los siguientes archivos y datos:

  * El certificado de firma en formato `.p12` (ejemplo: `certificate.p12`)
  * La contraseña del `.p12`

- Configurar el archivo `.env` con las credenciales necesarias. Parte de la plantilla:

```bash
cp .env.dist .env
```

Edita `.env` con:

```ini
CSC_LINK=/ruta/completa/al/certificate.p12
CSC_KEY_PASSWORD=la-contraseña-del-certificado
APPLE_ID=tu-correo@appleid.com
APPLE_APP_SPECIFIC_PASSWORD=contraseña-específica
APPLE_TEAM_ID=ABCDE12345
# APPLE_ASC_PROVIDER=TuProviderID
NOTARIZE_TOOL=notarytool
# SKIP_NOTARIZE=1  # Útil si quieres saltar temporalmente la notaría
```

Si prefieres usar el llavero de `notarytool`, puedes almacenar las credenciales una vez con:

```bash
xcrun notarytool store-credentials "notarytool-profile" \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_APP_SPECIFIC_PASSWORD"
```

> En ese caso puedes dejar `NOTARIZE_TOOL=notarytool` y opcionalmente definir `APPLE_ASC_PROVIDER`.

---

## 2️⃣ Instalación de dependencias

Desde la raíz del proyecto:

```bash
yarn install
```

---

## 3️⃣ Ejecutar la aplicación en desarrollo

Si quieres simplemente arrancar la app:

```bash
yarn start
```

Se abrirá la ventana de la aplicación.

---

Así es el aspecto actual de la aplicación:

![Screenshot](screenshot.png)

## 4️⃣ Build y firma del binario

Para generar el binario firmado para macOS:

```bash
yarn dist
```

Este comando toma las variables de `.env` automáticamente y generará la build en la carpeta `dist/` del proyecto.
Allí encontrarás el DMG y ZIP firmados, listos para distribución.

Si se proporcionaron las credenciales de Apple descritas arriba:

- El `.app` se enviará automáticamente a Apple para su notarización.
- Una vez aprobada, se aplicará (*staple*) el ticket tanto al `.app` como al `.dmg`.
- Los logs del proceso aparecerán en la consola; cualquier error detendrá la build.

Si la notaría está deshabilitada (`SKIP_NOTARIZE=1` o credenciales ausentes) el build seguirá generándose firmado, pero sin ticket de notaría.

---

⚠ **Nota importante:**

* Solo debes usar `yarn` para manejar las dependencias.
* No ejecutar nunca `npm install` ni crear `package-lock.json`.
