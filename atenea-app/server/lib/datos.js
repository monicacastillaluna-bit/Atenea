// Carpeta de datos del usuario, FUERA de la carpeta de la app, para que actualizar la
// app (reemplazar su carpeta por una versión nueva) no toque la base ni las claves.
// Por defecto: C:\Users\<usuario>\Atenea-datos (se cambia con ATENEA_DATOS).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const carpetaDatos = () => process.env.ATENEA_DATOS || path.join(os.homedir(), 'Atenea-datos');

const PLANTILLA_ENV = `# Claves y ajustes privados de Atenea. Este archivo vive fuera de la carpeta de la app,
# así que las actualizaciones no lo tocan. Completa lo que uses y reinicia la app.

# Motor de IA (elige el proveedor en la app: Ajustes → Motor de IA). Basta con uno.
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Copia opcional en Firestore (proyecto athenea-b8efd): ruta al service account.
# FIREBASE_SERVICE_ACCOUNT=C:\\Users\\Lenovo\\secrets\\athenea-firebase-adminsdk.json
`;

// Prepara la carpeta de datos. Si encuentra datos de una versión anterior dentro de la
// carpeta de la app (data/atenea.db y .env), los COPIA (no los borra) a la carpeta nueva.
export function prepararDatos(raizApp, log = console.log) {
  const dir = carpetaDatos();
  fs.mkdirSync(dir, { recursive: true });
  const db = path.join(dir, 'atenea.db');
  const env = path.join(dir, '.env');

  const dbVieja = path.join(raizApp, 'data', 'atenea.db');
  if (!fs.existsSync(db) && fs.existsSync(dbVieja)) {
    for (const suf of ['', '-wal', '-shm']) {
      if (fs.existsSync(dbVieja + suf)) fs.copyFileSync(dbVieja + suf, db + suf);
    }
    log(`Se copiaron tus datos anteriores a ${dir}`);
  }
  const envViejo = path.join(raizApp, '.env');
  if (!fs.existsSync(env)) {
    if (fs.existsSync(envViejo)) {
      fs.copyFileSync(envViejo, env);
      log(`Se copiaron tus claves (.env) a ${dir}`);
    } else {
      fs.writeFileSync(env, PLANTILLA_ENV, 'utf8');
      log(`Se creó ${env}: agrega ahí tu clave de IA y reinicia la app.`);
    }
  }
  return { dir, db, env };
}
