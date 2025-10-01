require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Cần module 'path'

const routes = require('./app/routes');

const PORT = process.env.PORT || 3000;
const app = express();

// Cấu hình CORS một cách rõ ràng
const corsOptions = {
  origin: '*', // Cho phép tất cả các origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

//main app
routes(app);

app.listen(PORT, () => console.log(`SERVER http://127.0.0.1:${PORT}`));
