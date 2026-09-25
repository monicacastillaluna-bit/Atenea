// Arranque "de un clic" (lo usa Iniciar Atenea.bat):
// 1. Si Atenea ya está corriendo, solo abre el navegador.
// 2. Instala dependencias o recompila la interfaz SOLO si algo cambió.
// 3. Crea (una vez) un acceso directo "Atenea" en el escritorio de Windows.
// 4. Arranca el servidor y abre el navegador.
import { spawnSync, exec } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const puerto = Number(process.env.PORT || 5180);
const url = `http://localhost:${puerto}`;
const esWindows = process.platform === 'win32';

function abrirNavegador() {
  exec(esWindows ? `start "" "${url}"` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
}

function correr(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: raiz, stdio: 'inherit', shell: esWindows });
  if (r.status !== 0) throw new Error(`Falló: ${cmd} ${args.join(' ')}`);
}

const huella = (archivo) => crypto.createHash('sha1').update(fs.readFileSync(archivo)).digest('hex');

function ultimaModificacion(dir) {
  let max = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    max = Math.max(max, e.isDirectory() ? ultimaModificacion(p) : fs.statSync(p).mtimeMs);
  }
  return max;
}

async function yaCorriendo() {
  try {
    const r = await fetch(`http://127.0.0.1:${puerto}/api/estado`, { signal: AbortSignal.timeout(1500) });
    const d = await r.json();
    return d.carpeta_datos ? 'actual' : 'anterior';
  } catch {
    return null;
  }
}

function dependencias() {
  const lock = path.join(raiz, 'package-lock.json');
  const marca = path.join(raiz, 'node_modules', '.atenea-lock');
  const h = huella(lock);
  if (fs.existsSync(marca) && fs.readFileSync(marca, 'utf8') === h) return;
  console.log('Instalando dependencias (solo la primera vez o tras una actualización; puede tardar unos minutos)...');
  correr('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error']);
  fs.writeFileSync(marca, h);
}

function interfaz() {
  const dist = path.join(raiz, 'web', 'dist', 'index.html');
  const fuentes = Math.max(
    ultimaModificacion(path.join(raiz, 'web', 'src')),
    fs.statSync(path.join(raiz, 'web', 'index.html')).mtimeMs,
    fs.statSync(path.join(raiz, 'package-lock.json')).mtimeMs,
  );
  if (fs.existsSync(dist) && fs.statSync(dist).mtimeMs >= fuentes) return;
  console.log('Preparando la interfaz...');
  correr('npm', ['run', 'build', '--silent']);
}

function accesoDirecto() {
  if (!esWindows) return;
  const bat = path.join(raiz, 'Iniciar Atenea.bat');
  // El escritorio puede estar en OneDrive: se le pregunta la ruta a Windows.
  const ps = [
    '$d=[Environment]::GetFolderPath("Desktop");',
    '$l=Join-Path $d "Atenea.lnk";',
    `$b='${bat.replace(/'/g, "''")}';`,
    'if (Test-Path $l) { $s=(New-Object -ComObject WScript.Shell).CreateShortcut($l); if ($s.TargetPath -eq $b) { exit 0 } }',
    '$s=(New-Object -ComObject WScript.Shell).CreateShortcut($l);',
    '$s.TargetPath=$b; $s.WorkingDirectory=Split-Path $b; $s.WindowStyle=7;',
    '$s.Description="Atenea - Centro de mando interno";',
    '$s.IconLocation="$env:SystemRoot\\System32\\shell32.dll,13";',
    '$s.Save(); Write-Output "creado"',
  ].join(' ');
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { encoding: 'utf8' });
  if (r.stdout?.includes('creado')) console.log('Se creó el acceso directo «Atenea» en tu escritorio.');
}

try {
  const corriendo = await yaCorriendo();
  if (corriendo === 'actual') {
    console.log('Atenea ya estaba abierta: abriendo el navegador.');
    abrirNavegador();
    process.exit(0);
  }
  if (corriendo === 'anterior') {
    console.log('Hay una versión ANTERIOR de Atenea abierta. Cierra su ventana negra y vuelve a abrir esta.');
    process.exit(1);
  }
  dependencias();
  interfaz();
  try { accesoDirecto(); } catch { /* el acceso directo es opcional */ }
  process.argv.push('--abrir');
  await import('./server/index.js');
} catch (e) {
  console.error(`\n${e.message}`);
  process.exit(1);
}
