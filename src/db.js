const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'truaudit',
  user: 'truaudit_app',
  password: 'yourpassword',
  port: 5432
});

module.exports = pool;