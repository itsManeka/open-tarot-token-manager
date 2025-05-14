const { db, admin } = require('../firebase');

async function adicionarNotificacoes(userId, title, message, type) {
    try {
        const ref = db.collection("users").doc(userId).collection("notifications");
        await ref.add({
            title,
            message,
            type,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = { adicionarNotificacoes };