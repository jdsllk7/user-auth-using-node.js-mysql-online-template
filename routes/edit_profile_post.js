//---------------------------------------------submit_edit_profile------------------------------------------------------
const uuidv1 = require('uuid/v1');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const page404_template = require('./page404_template');
const {
  check,
  validationResult
} = require('express-validator');

const mysql = require('mysql');
const con = require('./db_connect');

exports.edit_profile_post = function (req, res) {

  //Firstly establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    if (!req.session.userId) { //reroute home if logged out
      return res.redirect('/');
    }

    if (req.method === "POST") {
      var post = req.body,
        fname = post.first_name,
        lname = post.last_name,
        contact = post.contact;

      //Start form validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) { //if errors found
        var output = [];
        for (var i = 0; i < errors.array().length; i++) {
          output.push(errors.array()[i].msg);
        }

        return res.render('edit_profile', {
          error: output,
          email: req.session.email,
          first_name: fname,
          last_name: lname,
          contact: contact,
          user: req.session.first_name
        });

      } else { //if NO errors

        //generate hash


        //------------Start mailing----------------------------
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        var edit_profile = require('./edit_profile_template');
        const mailOptions = {
          from: 'VillageSavers <villagesavers@gmail.com>', // sender address
          to: req.session.email, // list of receivers
          subject: 'Profile Edited Successfully', // Subject line
          html: edit_profile(req) // load html template
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) { //if email was NEVER sent then DON'T INSERT new user
            console.log(err);
            return res.render('edit_profile', {
              error: ['Sorry, an error occurred while editing your profile. Check internet connection & try again - [503]'],
              email: req.session.email,
              first_name: fname,
              last_name: lname,
              contact: contact,
              user: req.session.first_name
            });

          } else { //if email was sent then UPDATE user

            const token = uuidv1();
            sql = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ? and ?? = ?";
            inserts = ['users', 'first_name', fname, 'last_name', lname, 'contact', contact, 'token', token, 'id', req.session.userId, 'active', 1];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function (err1, result) {
              if (err1) {
                console.log(err1);
                return res.status(500).send(page404_template(req));
              }
              console.log('Email sent');
              req.session.first_name = fname;
              req.session.last_name = lname;
              req.session.contact = contact;

              return res.redirect('/edit_profile?msg=' + encodeURIComponent('Profile edited Successfully'));
            });
          }
        });
        //-----------End Mailing----------------------------------


      }

    } else {
      return res.render('edit_profile', {
        error: ['Sorry, an error occurred while editing your profile. Check internet connection & try again - [504]'],
        email: req.session.email,
        user: req.session.first_name
      });
    }
    connection.release();
  });
};