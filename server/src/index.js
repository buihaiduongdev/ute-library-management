require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Cần module 'path'

const routes = require("./app/routes");
const { startAllJobs } = require("./jobs/emailNotifications");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "../public")));

// Cấu hình CORS để cho phép tất cả origins
app.use(cors({
  origin: true, // Cho phép tất cả origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Xử lý preflight requests trước khi đến CORS middleware
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

app.use(express.json());

//main app
routes(app);

app.listen(PORT, () => {
  console.log(`SERVER http://127.0.0.1:${PORT}`);

  // ← THÊM DÒNG NÀY để khởi động scheduled jobs
  startAllJobs();
});