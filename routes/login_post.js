//-----------------------------------------------submit_login------------------------------------------------------
const bcrypt = require('bcryptjs');
const page404_template = require('../routes/page404_template');
const {
  check,
  validationResult
} = require('express-validator');

const mysql = require('mysql');
const con = require('./db_connect');

exports.login_post = function (req, res) {

  //first establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    if (req.session.userId) { //reroute home if logged in
      return res.redirect('/');
    }

    if (req.method === "POST") {
      var post = req.body,
        email = post.email,
        pass = post.password;


      //Start form validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        var output = [];
        for (var i = 0; i < errors.array().length; i++) {
          output[0] = errors.array()[i].msg;
        }

        return res.render('login', {
          error: output,
          email: email
        });

      } else {

        //Check if account is activated
        var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
        var inserts = ['users', 'email', email, 'active', 1];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (err, results) {
          if (err) {
            console.log(err);
            return res.status(500).send(page404_template(req));
          }

          if (results.length === 1) {
            bcrypt.compare(pass, results[0].password, function (err, match) {
              if (err) {
                console.log(err);
                return res.status(500).send(page404_template(req));
              }
              if (match && results.length === 1) { //passwords match

                req.session.userId = results[0].id;
                req.session.first_name = results[0].first_name;
                req.session.last_name = results[0].last_name;
                req.session.email = results[0].email;
                req.session.contact = results[0].contact;
                req.session.token = results[0].token;

                console.log(req.session.first_name + ' is in...');

                return res.redirect('/');

              } else { //passwords do not match
                return res.render('login', {
                  email: email,
                  error: ['Incorrect Credentials - [508]']
                });
              }
            });
          } else { //Incorrect Credentials/Account not activated
            return res.render('login', {
              email: email,
              error: ['Sorry, we have no record of this account - [509]']
            });
          }

        });

      } //end else

    } else {
      return res.render('login', {
        error: ['Sorry, an error occurred while logging you in. Check internet connection & try again - [510]']
      });
    }
    connection.release();
  });
};