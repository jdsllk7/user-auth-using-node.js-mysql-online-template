//-----------------------------------------------forgot_post------------------------------------------------------
const nodemailer = require('nodemailer');
require('dotenv').config();
const page404_template = require('../routes/page404_template');
const {
  check,
  validationResult
} = require('express-validator');
const mysql = require('mysql');
const con = require('./db_connect');

exports.forgot_post = function (req, res) {

  //Firstly establish db connection
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
        email = post.email;

      //Start form validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        var output = [];
        for (var i = 0; i < errors.array().length; i++) {
          output[0] = errors.array()[i].msg;
        }
        return res.render('forgot', {
          error: output,
          email: email
        });

      } else {

        //check if email exists first & if account is activated
        var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
        var inserts = ['users', 'email', email, 'active', 1];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (err, results) {
          if (err) {
            console.log(err);
            return res.status(500).send(page404_template(req));
          }
          if (results.length === 1) {

            //initializing sessions used in template
            req.session.recoverToken = results[0].token;
            req.session.recoverFname = results[0].first_name;
            req.session.recoverEmail = results[0].email;

            //------------Start mailing----------------------------
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
              }
            });
            var forgot_template = require('./forgot_template');
            const mailOptions = {
              from: 'VillageSavers <villagesavers@gmail.com>', // sender address
              to: req.session.recoverEmail, // list of receivers
              subject: 'Password Reset', // Subject line
              html: forgot_template(req) // load html template
            };
            transporter.sendMail(mailOptions, function (err, info) {
              if (err) {
                console.log(err);
                return res.render('forgot', {
                  email: email,
                  error: ['Sorry, an error occurred while resetting your password. Check internet connection & try again - [505]']
                });
              } else {
                console.log('Email sent');
                return res.render('forgot', {
                  success: 'An email has been sent to \'' + req.session.recoverEmail + '\' with further instructions'
                });
              }
            });
            //-----------End Mailing----------------------------------

          } else { //if email don't match
            return res.render('forgot', {
              email: email,
              error: ['This email does not exist - [506]']
            });
          }
        }); //end querying

      } //end form validation

    } else {
      return res.render('forgot', {
        error: ['Sorry, an error occurred while resetting your password. Check internet connection & try again - [507]']
      });
    }
    connection.release();
  });
}; //end callback method