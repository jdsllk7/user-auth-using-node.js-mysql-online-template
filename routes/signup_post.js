//---------------------------------------------submit_signup------------------------------------------------------
const uuidv1 = require('uuid/v1');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const page404_template = require('../routes/page404_template');
const {
  check,
  validationResult
} = require('express-validator');

const mysql = require('mysql');
const con = require('./db_connect');

exports.signup_post = function (req, res) {

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
        email = post.email,
        pass = post.password,
        rpass = post.rpassword,
        fname = post.first_name,
        lname = post.last_name,
        contact = post.contact;

      //Start form validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        var output = [];
        for (var i = 0; i < errors.array().length; i++) {
          output.push(errors.array()[i].msg);
        }

        return res.render('signup', {
          error: output,
          contact: contact,
          email: email,
          first_name: fname,
          last_name: lname
        });

      } else {

        //crypt password using bcrypt
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(pass, salt, function (err, hash) {

            var sql = "SELECT * FROM ?? WHERE ?? = ?";
            var inserts = ['users', 'email', email];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function (err, results) {
              if (err) {
                console.log(err);
                return res.status(500).send(page404_template(req));
              }
              if (results.length === 0) {

                //generate hash
                const token = uuidv1();
                req.session.recoverToken = token;
                req.session.recoverFname = fname;
                req.session.recoverEmail = email;

                //------------Start mailing----------------------------
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD
                  }
                });
                var activate_acc_template = require('./activate_acc_template');
                const mailOptions = {
                  from: 'VillageSavers <villagesavers@gmail.com>', // sender address
                  to: req.session.recoverEmail, // list of receivers
                  subject: 'Account Activation', // Subject line
                  html: activate_acc_template(req) // load html template
                };
                transporter.sendMail(mailOptions, function (err, info) {
                  if (err) { //if email was never sent then DON'T INSERT new user
                    console.log(err);
                    return res.render('signup', {
                      email: email,
                      first_name: fname,
                      last_name: lname,
                      contact: contact,
                      error: ['Sorry, an error occurred while creating your account. Check internet connection & try again - [513]']
                    });

                  } else { //if email was sent then INSERT new user

                    // Store encrypted password in DB also
                    sql = "INSERT INTO ?? (`first_name`,`last_name`,`email`,`contact`,`password`,`token`) VALUES (?, ?, ?, ?, ?, ?)";
                    inserts = ['users', fname, lname, email, contact, hash, token];
                    sql = mysql.format(sql, inserts);

                    connection.query(sql, function (err1, result) {
                      if (err1) {
                        console.log(err1);
                        return res.status(500).send(page404_template(req));
                      }
                      console.log('Email sent');
                      return res.render('signup', {
                        success: 'Account Created Successfully! Click the \'Activate\' button in the email we\'ve sent to: \'' + email + '\' to activate your account.'
                      });
                    });
                  }
                });
                //-----------End Mailing----------------------------------

              } else {
                return res.render('signup', {
                  email: email,
                  first_name: fname,
                  last_name: lname,
                  contact: contact,
                  error: ['Sorry, an error occurred while creating your account. Check internet connection & try again - [514]']
                });
              }
            });
          });
        });

      } //end form validation

    } else {
      return res.render('signup', {
        error: ['Sorry, an error occurred while creating your account. Check internet connection & try again - [515]']
      });
    }
    connection.release();
  });
};