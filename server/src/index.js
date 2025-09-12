require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Cần module 'path'

const routes = require('./app/routes');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());

app.use(express.json());

routes(app);

app.listen(PORT, () => console.log(`SERVER http://127.0.0.1:${PORT}`));
