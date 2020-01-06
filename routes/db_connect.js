const mysql = require('mysql');
const db_config = require('./db_config');

var connection = mysql.createPool({
  host: db_config.host,
  user: db_config.user,
  password: db_config.password,
  database: db_config.database
});

module.exports = connection;
