const {
  check,
  validationResult
} = require('express-validator');

const mysql = require('mysql');
const page404_template = require('../routes/page404_template');
const con = require('./db_connect');

exports.contact_us_post = function (req, res) {

  //Firstly establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    if (req.method === "POST") {
      var post = req.body,
        email = post.email,
        subject = post.subject,
        body = post.body;

      //Start form validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        var output = [];
        for (var i = 0; i < errors.array().length; i++) {
          output.push(errors.array()[i].msg);
        }
        return res.status(422).render('contact_us', {
          error: output,
          subject: subject,
          body: body,
          email: email,
          user: req.session.first_name
        });

      } else {

        var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ? and ?? = ?";
        var inserts = ['reports', 'email', email, 'subject', subject, 'body', body];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (err, results) {
          if (err) {
            console.log(err);
            return res.status(500).send(page404_template(req));
          }
          if (results.length === 0) {

            sql = "INSERT INTO ?? (`email`,`subject`,`body`) VALUES (?, ?, ?)";
            inserts = ['reports', email, subject, body];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function (err1, result) {
              if (err1) {
                console.log(err1);
                return res.status(500).send(page404_template(req));
              } else {
                return res.render('contact_us', {
                  success: 'Thank you for getting in touch with us. We\'ll get back to you asap.',
                  subject: '',
                  body: '',
                  email: email,
                  user: req.session.first_name
                });
              }
            });
          } else { //Wrong Credentials/Account not activated
            return res.render('contact_us', {
              success: 'Seems like you already submitted this query. We\'ll get back to you asap',
              subject: subject,
              body: body,
              email: email,
              user: req.session.first_name
            });
          }

        });

      } //end form validation


    } else {
      return res.render('contact_us', {
        error: ['Sorry, an error occurred. Check internet connection & try again - [502]']
      });
    }
    connection.release();
  });
};