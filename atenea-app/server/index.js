// Punto de entrada: `npm start` (o "Iniciar Atenea.bat" en Windows).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const [mayor, menor] = process.versions.node.split('.').map(Number);
if (mayor < 22 || (mayor === 22 && menor < 13)) {
  console.error(`Atenea necesita Node.js 22.13 o superior (tienes ${process.versions.node}). Descárgalo en https://nodejs.org`);
  process.exit(1);
}

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raizApp = path.resolve(aqui, '..');
const { config } = await import('dotenv');
config({ path: path.join(raizApp, '.env'), quiet: true });

const { abrirDb } = await import('./lib/db.js');
const { crearApp } = await import('./app.js');
const { iniciarProgramador } = await import('./lib/recoleccion.js');

const archivoDb = process.env.ATENEA_DB || path.join(raizApp, 'data', 'atenea.db');
const db = abrirDb(archivoDb);
const app = crearApp(db, { raizRepo: path.resolve(raizApp, '..'), dirWeb: path.join(raizApp, 'web', 'dist') });
const puerto = Number(process.env.PORT || 5180);

// Solo escucha en este computador: la app es de uso interno y no debe quedar expuesta en la red.
app.listen(puerto, '127.0.0.1', () => {
  const url = `http://localhost:${puerto}`;
  console.log(`Atenea lista en ${url}  (base de datos: ${archivoDb})`);
  iniciarProgramador(db);
  if (process.argv.includes('--abrir')) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(cmd);
  }
});
