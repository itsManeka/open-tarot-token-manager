require('dotenv').config();

const express = require('express');
const router = express.Router();

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const { adicionarFichas } = require('../src/token-manager');

const bodyParser = require('body-parser');

router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Erro na verificação do webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.uid;
        const qtd = parseInt(session.metadata.qtd || '1', 10);

        await adicionarFichas(userId, qtd);
    }

    res.json({ received: true });
});

module.exports = router;