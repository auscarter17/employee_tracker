const mysql = require('mysql2');
require('dotenv').config()

const db = mysql.createConnection({
    host: 'localhost',
    // gets username from dotenv
    user: process.env.DB_USER,
    // gets password from dotenv
    password: process.env.DB_PW,
    // gets db name from dotenv
    database: process.env.DB_NAME
  });

  module.exports = db;