const { db } = require('../firebase');

async function adicionarFichas(userId, quantidade) {
    try {
        const ref = db.doc(`users/${userId}/wallet/tokens`);
        const snap = await ref.get();

        if (!snap.exists) {
            throw new Error('Usuário não encontrado');
        }

        data = snap.data();
        const newAmount = (data.amount ?? 0) + quantidade;

        await ref.update({
            amount: newAmount,
        });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = { adicionarFichas };