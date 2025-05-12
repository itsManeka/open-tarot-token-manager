require('dotenv').config();

const express = require('express');
const cors = require('cors');

const allowedOrigins = [process.env.URL_LOCAL, process.env.URL_OFICIAL];

const app = express();
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

app.use('/tokens', require('./routes/tokens'));
app.use('/shop', require('./routes/shop'));
app.use('/webhook', require('./routes/webhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));