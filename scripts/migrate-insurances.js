const admin = require('firebase-admin');
const serviceAccount = require('../saas-d5a66-firebase-adminsdk-fbsvc-3d933baf8e.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

(async () => {
  const snap = await db.collection('insurances').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const update = {};
    if (data.amount !== undefined) update.amount = admin.firestore.FieldValue.delete();
    if (data.paymentStatus === undefined) update.paymentStatus = 'do_zaplaty';
    if (data.nextPaymentDate === undefined) update.nextPaymentDate = '';
    if (data.amountDue === undefined) update.amountDue = 0;
    if (data.paymentHistory === undefined) update.paymentHistory = [];
    if (Object.keys(update).length) await doc.ref.update(update);
  }
  console.log('Migracja insurances zakończona.');
  process.exit(0);
})(); 