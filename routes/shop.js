require('dotenv').config();

const express = require('express');
const router = express.Router();

const Stripe = require('stripe');

const { db, verifyUser } = require('../firebase');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/checkout-session', async (req, res) => {
    const { priceId } = req.body;

    if (!priceId) {
        return res.status(400).json({ error: 'Parâmetros ausentes' });
    }

    try {
        const uid = await verifyUser(req);

        const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
        const qtd = price.product.metadata.qtd || '1';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.URL_OFICIAL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL_OFICIAL}/canceled`,
            metadata: {
                uid,
                qtd
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
    }
});

router.get('/verify-session', async (req, res) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
        return res.status(400).json({ error: 'Parâmetro session_id ausente' });
    }

    try {
        const uidToken = await verifyUser(req);

        const session = await stripe.checkout.sessions.retrieve(sessionId,  {
            expand: ['line_items.data.price.product'],
        });

        const uidSession = session.metadata.uid;

        if (uidToken !== uidSession) {
            return res.status(403).json({ error: 'Acesso não autorizado à sessão de pagamento' });
        }


        const lineItem = session.line_items?.data?.[0];
        const product = lineItem?.price?.product;

        if (!product) {
            return res.status(500).json({ error: 'Produto não encontrado na sessão' });
        }

        const amountTotal = session.amount_total;
        const currency = session.currency;
        const status = session.payment_status;

        const docRef = db.collection('users').doc(uidSession).collection('payments').doc(sessionId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            await docRef.set({
                sessionId,
                product: {
                    name: product.name,
                    images: product.images || [],
                    description: product.description,
                },
                amountTotal,
                currency,
                status,
                createdAt: new Date(),
            });
        }

        res.json({
            sessionId,
            status,
            product: {
                name: product.name,
                images: product.images || [],
                description: product.description,
            },
            amountTotal,
            currency,
        });
    } catch (err) {
        console.error('Erro ao verificar sessão:', err);
        res.status(500).json({ error: 'Erro ao verificar sessão de pagamento' });
    }
});

router.get('/products', async (req, res) => {
    const products = await stripe.prices.list({ expand: ['data.product'] });
    const data = products.data;

    res.json(data);
});

module.exports = router;
