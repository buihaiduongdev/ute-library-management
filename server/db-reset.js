require('dotenv').config();
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

const runSqlScript = async (pool, filePath) => {
  const script = fs.readFileSync(filePath, 'utf8');
  const requests = script.split('GO\r\n');
  for (const request of requests) {
    if (request.trim() !== '') {
      await pool.request().query(request);
    }
  }
};

const main = async () => {
  try {
    console.log('Connecting to the database...');
    const pool = await sql.connect(dbConfig);
    console.log('Connected to the database.');

    console.log('Running 01_create_tables.sql...');
    await runSqlScript(pool, path.join(__dirname, 'database', '01_create_tables.sql'));
    console.log('Finished running 01_create_tables.sql.');

    console.log('Running 02_samples.sql...');
    await runSqlScript(pool, path.join(__dirname, 'database', '02_samples.sql'));
    console.log('Finished running 02_samples.sql.');

    console.log('Running create_login.sql...');
    await runSqlScript(pool, path.join(__dirname, 'database', 'create_login.sql'));
    console.log('Finished running create_login.sql.');

    console.log('Database reset successfully!');

    await pool.close();
  } catch (err) {
    console.error('Error resetting the database:', err);
  }
};

main();
