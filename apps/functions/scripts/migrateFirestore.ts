// @ts-ignore
const admin = require('firebase-admin');

// NOTE: Service account credentials should be loaded from environment variables
// or a secure secret manager. Never commit credentials to the repository.
// Example: const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

// This script is for migration purposes only and should not be used in production
// with hardcoded credentials. Use environment variables or secret management instead.

// For migration, load credentials from environment:
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
}

const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}
const db = admin.firestore();

async function migrate() {
  // Przykładowy userId (możesz podmienić na realny)
  const userId = 'test-user-123';
  const now = new Date().toISOString();

  // Subskrypcje
  await db.collection('subscriptions').add({
    userId,
    type: 'Netflix',
    name: 'Netflix Premium',
    amount: 49.99,
    endDate: '2024-12-31',
    note: 'Do końca roku promocja',
    status: 'active',
    attachments: [],
    createdAt: now,
    updatedAt: now,
  });

  // Kredyty
  await db.collection('loans').add({
    userId,
    type: 'Kredyt hipoteczny',
    name: 'PKO BP',
    amount: 250000,
    endDate: '2040-01-01',
    note: 'Rata 1500 PLN',
    status: 'active',
    attachments: [],
    createdAt: now,
    updatedAt: now,
  });

  // Ubezpieczenia
  await db.collection('insurances').add({
    userId,
    type: 'OC',
    name: 'PZU',
    amount: 600,
    endDate: '2025-03-15',
    note: 'Samochód',
    status: 'active',
    attachments: [],
    createdAt: now,
    updatedAt: now,
  });

  // Finished (archiwalne)
  await db.collection('finished').add({
    userId,
    type: 'Kredyt gotówkowy',
    name: 'Alior Bank',
    amount: 10000,
    endDate: '2023-05-01',
    note: 'Spłacony',
    status: 'finished',
    attachments: [],
    createdAt: now,
    updatedAt: now,
  });

  console.log('Migracja zakończona. Przykładowe dane dodane do Firestore.');
}

migrate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 