require('dotenv').config()

const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const db = admin.firestore();
const auth = admin.auth();

async function verifyUser(req) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('Unauthorized');
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
}

module.exports = { admin, db, auth, verifyUser };