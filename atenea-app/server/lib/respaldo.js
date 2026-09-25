// Respaldo: exportar/importar toda la base a JSON, y copia en Firestore
// (proyecto athenea-b8efd) para tener los datos también en la nube.
import fs from 'node:fs';
import { TABLAS, transaccion, ahora, guardarAjuste, leerAjuste } from './db.js';

// Ruta en Firestore: mismo patrón que upload_corpus.js (artifacts/athenea/public/data/...).
const RAIZ = ['artifacts', 'athenea', 'public', 'data'];
const coleccion = (t) => `app_${t}`;
const claveDe = (t, r) => String(t === 'paises' || t === 'dolores' ? r.codigo : t === 'ajustes' ? r.clave : r.id);

export function exportar(db) {
  const datos = { app: 'atenea-app', exportado_en: ahora(), tablas: {} };
  for (const t of TABLAS) datos.tablas[t] = db.prepare(`SELECT * FROM ${t}`).all();
  return datos;
}

export function importar(db, datos) {
  if (datos?.app !== 'atenea-app' || !datos.tablas) throw new Error('El archivo no es un respaldo de atenea-app');
  transaccion(db, () => {
    db.exec('PRAGMA defer_foreign_keys = ON');
    for (const t of [...TABLAS].reverse()) db.exec(`DELETE FROM ${t}`);
    for (const t of TABLAS) {
      for (const r of datos.tablas[t] ?? []) {
        const cols = Object.keys(r);
        db.prepare(`INSERT INTO ${t} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
          .run(...cols.map((c) => r[c]));
      }
    }
  });
  return Object.fromEntries(TABLAS.map((t) => [t, datos.tablas[t]?.length ?? 0]));
}

let firestore = null;
let proyecto = null;

export function estadoFirestore(db) {
  const archivo = process.env.FIREBASE_SERVICE_ACCOUNT;
  return {
    configurado: Boolean(archivo),
    archivo_existe: archivo ? fs.existsSync(archivo) : false,
    ultima_sincronizacion: leerAjuste(db, 'ultima_sincronizacion_firestore', null),
  };
}

async function conectar() {
  if (firestore) return firestore;
  const archivo = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!archivo || !fs.existsSync(archivo)) {
    throw new Error('Firestore no está configurado: define FIREBASE_SERVICE_ACCOUNT en el .env de tu carpeta de datos con la ruta al service account.');
  }
  let admin;
  try {
    admin = { app: await import('firebase-admin/app'), fs: await import('firebase-admin/firestore') };
  } catch {
    throw new Error('Falta el paquete firebase-admin: ejecuta "npm install" en atenea-app.');
  }
  let cuenta;
  try {
    cuenta = JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch {
    throw new Error('El archivo del service account no es un JSON válido. Descárgalo de nuevo desde la consola de Firebase.');
  }
  if (cuenta.type !== 'service_account' || !cuenta.project_id) {
    throw new Error('Ese archivo no es un service account de Firebase (le falta "type": "service_account" o "project_id").');
  }
  proyecto = cuenta.project_id;
  const app = admin.app.getApps().find((a) => a.name === 'atenea-app')
    ?? admin.app.initializeApp({ credential: admin.app.cert(cuenta) }, 'atenea-app');
  firestore = admin.fs.getFirestore(app);
  return firestore;
}

const ref = (fsdb, t) => fsdb.collection(RAIZ[0]).doc(RAIZ[1]).collection(RAIZ[2]).doc(RAIZ[3]).collection(coleccion(t));

// Comprueba credenciales y permisos leyendo sin escribir nada.
export async function probarFirestore() {
  const fsdb = await conectar();
  try {
    const base = fsdb.collection(RAIZ[0]).doc(RAIZ[1]).collection(RAIZ[2]).doc(RAIZ[3]);
    const copia = await base.collection(coleccion('paises')).limit(1).get();
    const corpus = await base.collection('corpus').limit(1).get();
    return { proyecto, copia_existente: !copia.empty, corpus_visible: !corpus.empty };
  } catch (e) {
    firestore = null;
    if (/PERMISSION_DENIED|permission/i.test(e.message)) {
      throw new Error(`El service account no tiene permiso sobre Firestore en el proyecto ${proyecto}. Revisa en la consola de Google Cloud que tenga el rol «Cloud Datastore User» o «Editor».`, { cause: e });
    }
    if (/NOT_FOUND|does not exist/i.test(e.message)) {
      throw new Error(`El proyecto ${proyecto} no tiene una base de Firestore activa. Actívala en la consola de Firebase.`, { cause: e });
    }
    throw new Error(`No se pudo conectar con Firestore (${proyecto}): ${e.message}`, { cause: e });
  }
}

// Sube todas las tablas (sobrescribe por id: es idempotente) y borra en la nube lo que ya no existe localmente.
export async function subirAFirestore(db) {
  const fsdb = await conectar();
  const res = {};
  for (const t of TABLAS) {
    const locales = db.prepare(`SELECT * FROM ${t}`).all();
    const col = ref(fsdb, t);
    const remotos = new Set((await col.listDocuments()).map((d) => d.id));
    const ops = [];
    for (const r of locales) {
      const id = claveDe(t, r);
      remotos.delete(id);
      ops.push((b) => b.set(col.doc(id), r));
    }
    for (const id of remotos) ops.push((b) => b.delete(col.doc(id)));
    for (let i = 0; i < ops.length; i += 400) {
      const b = fsdb.batch();
      ops.slice(i, i + 400).forEach((op) => op(b));
      await b.commit();
    }
    res[t] = locales.length;
  }
  guardarAjuste(db, 'ultima_sincronizacion_firestore', ahora());
  return res;
}

// Reemplaza la base local con la copia de Firestore.
export async function bajarDeFirestore(db) {
  const fsdb = await conectar();
  const datos = { app: 'atenea-app', tablas: {} };
  for (const t of TABLAS) {
    const snap = await ref(fsdb, t).get();
    datos.tablas[t] = snap.docs.map((d) => d.data());
  }
  if (!datos.tablas.paises.length) throw new Error('Firestore no tiene datos de atenea-app todavía.');
  return importar(db, datos);
}
