const mysql = require('mysql');

var con = require('./db_connect');
var db_config = require('./db_config');


//Firstly establish db connection
con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
        console.log(db_err);
        throw db_err;
    }

    //db created
    var sql = "CREATE DATABASE IF NOT EXISTS " + db_config.database;
    connection.query(sql, function (err, result) {
        connection.release();
        if (err) {
            console.log(err);
            throw err;
        }
    });

    //users tables
    sql = "CREATE TABLE IF NOT EXISTS users (" +
        "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
        "first_name VARCHAR(30) NOT NULL," +
        "last_name VARCHAR(30) NOT NULL," +
        "email VARCHAR(30) NOT NULL," +
        "contact VARCHAR(10) NOT NULL," +
        "password VARCHAR(200) NOT NULL," +
        "token VARCHAR(100) NOT NULL," +
        "active BOOL NOT NULL DEFAULT 0," +
        "token_expiry_date TIMESTAMP NOT NULL DEFAULT '1970-01-01 00:00:01'," +
        "signup_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
        "UNIQUE (email)" +
        ")";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    });


    //errors table
    sql = "CREATE TABLE IF NOT EXISTS errors (" +
        "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
        "bug VARCHAR(255) NOT NULL," +
        "date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
        "UNIQUE (bug)" +
        ")";

    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    });


    //reports table
    sql = "CREATE TABLE IF NOT EXISTS reports (" +
        "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY," +
        "email VARCHAR(30) NOT NULL," +
        "subject VARCHAR(30) NOT NULL," +
        "body VARCHAR(255) NOT NULL," +
        "date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" +
        ")";

    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
    });

}); //end db connection
// global.db = con;