// Carga registros_corpus_athenea_v1.json a Firestore (proyecto athenea-b8efd).
// Uso: node "admin o herramientas/upload_corpus.js" <ruta-al-service-account.json>
//
// Colección destino: artifacts/athenea/public/data/corpus/{id}
// (misma convención de rutas que usaba admin o herramientas/uploader_antigravity.jsx para skills,
// con appId = "athenea" en vez del "antigravity-prod" del sandbox de Canvas.)

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const APP_ID = 'athenea';
const CORPUS_JSON = path.join(__dirname, '..', 'registros_corpus_athenea_v1.json');

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error('Falta la ruta al service account JSON.');
  console.error('Uso: node upload_corpus.js <ruta-al-service-account.json>');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function main() {
  const data = JSON.parse(fs.readFileSync(CORPUS_JSON, 'utf8'));
  const registros = data.registros;

  console.log(`Proyecto Firestore: ${serviceAccount.project_id}`);
  console.log(`Colección: artifacts/${APP_ID}/public/data/corpus`);
  console.log(`Registros a cargar: ${registros.length}\n`);

  let ok = 0;
  const errores = [];

  for (const r of registros) {
    try {
      const docRef = db
        .collection('artifacts')
        .doc(APP_ID)
        .collection('public')
        .doc('data')
        .collection('corpus')
        .doc(r.id);

      await docRef.set({
        ...r,
        esquema_version: data.esquema_version,
        updatedAt: new Date().toISOString(),
      });

      ok++;
      process.stdout.write(`  ✓ ${r.id}\n`);
    } catch (err) {
      errores.push({ id: r.id, error: err.message });
      process.stdout.write(`  ✗ ${r.id}: ${err.message}\n`);
    }
  }

  console.log(`\nCargados: ${ok}/${registros.length}`);
  if (errores.length) {
    console.log(`Errores: ${errores.length}`);
    errores.forEach((e) => console.log(`  ${e.id}: ${e.error}`));
  }

  process.exit(errores.length ? 1 : 0);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
