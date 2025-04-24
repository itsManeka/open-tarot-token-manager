const express = require('express');
const router = express.Router();
const { db, auth, admin } = require('../firebase');

const CLAIM_INTERVAL = 24 * 60 * 60 * 1000;

async function verifyUser(req) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('Unauthorized');
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
}

router.post('/claim', async (req, res) => {
    try {
        const uid = await verifyUser(req);
        const ref = db.doc(`users/${uid}/wallet/tokens`);
        const snap = await ref.get();

        const now = new Date();
        const data = snap.exists ? snap.data() : { amount: 0, lastClaim: admin.firestore.Timestamp.fromDate(new Date(0)) };
        const lastClaim = data.lastClaim.toDate();
        const diff = now.getTime() - lastClaim.getTime();

        if (diff < CLAIM_INTERVAL) {
            const next = new Date(lastClaim.getTime() + CLAIM_INTERVAL);
            return res.status(403).json({
                error: 'Too soon',
                nextClaim: next,
                amount: data.amount ?? 0,
            });
        }

        const newAmount = (data.amount ?? 0) + 1;
        const newLastClaim = admin.firestore.Timestamp.fromDate(now)
        const newNexClaim = new Date(newLastClaim.toDate().getTime() + CLAIM_INTERVAL);

        await ref.set({
            amount: newAmount,
            lastClaim: newLastClaim,
        });

        res.json({
            success: true,
            amount: newAmount,
            nextClaim: newNexClaim
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.post('/use', async (req, res) => {
    try {
        const uid = await verifyUser(req);
        const ref = db.doc(`users/${uid}/wallet/tokens`);
        const snap = await ref.get();

        if (!snap.exists || snap.data().amount < 1) {
            return res.status(400).json({ error: 'Insufficient tokens' });
        }

        const newAmount = snap.data().amount - 1;

        await ref.update({ amount: newAmount });

        res.json({ success: true, amount: newAmount });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.get('/status', async (req, res) => {
    try {
        const uid = await verifyUser(req);
        const ref = db.doc(`users/${uid}/wallet/tokens`);
        const snap = await ref.get();

        const now = new Date();

        if (!snap.exists) {
            const initialData = {
                amount: 10,
                lastClaim: admin.firestore.Timestamp.fromDate(new Date(0)),
            };
            await ref.set(initialData);
            return res.json({
                amount: 10,
                canClaim: true,
                nextClaimIn: 0,
            });
        }

        const data = snap.data();
        const lastClaim = data.lastClaim.toDate();
        const diff = now.getTime() - lastClaim.getTime();

        const canClaim = diff >= CLAIM_INTERVAL;
        const nextClaimIn = canClaim ? 0 : CLAIM_INTERVAL - diff;

        res.json({
            amount: data.amount ?? 0,
            canClaim,
            nextClaimIn,
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

module.exports = router;