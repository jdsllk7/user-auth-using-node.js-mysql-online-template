//------------------------------------home functionality----------------------------------------------
const mysql = require('mysql');
const page404_template = require('../routes/page404_template');
const nodemailer = require('nodemailer');
const con = require('./db_connect');

exports.index = function (req, res) {

  //Firstly establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }

    req.session.recoverID = 0;

    var msg, er;

    if (req.session.userId) {

      //detect any messages from other pages
      if (typeof req.query.msg !== 'undefined') {
        msg = req.query.msg;
      } else if (typeof req.query.er !== 'undefined') {
        er = [req.query.er];
      } else {
        msg = 'You are logged in';
      }

      var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
      var inserts = ['users', 'id', req.session.userId, 'active', 1];
      sql = mysql.format(sql, inserts);

      connection.query(sql, function (err, results) {
        if (err) {
          console.log(err);
          return res.status(500).send(page404_template(req));
        }
        if (results.length === 0) {
          return res.redirect('/logout');
        }
        return res.render('index', {
          success: msg,
          error: er,
          user: results[0].first_name
        });
      });

    } else {

      //detect any messages from other page redirects
      if (typeof req.query.msg !== 'undefined') {
        msg = req.query.msg;
      } else if (typeof req.query.er !== 'undefined') {
        er = [req.query.er];
      } else {
        er = 'You are logged out';
      }
      return res.render('index', {
        error: er,
        success: msg
      });
    }
    connection.release();
  });
};





//------------------------------------login functionality----------------------------------------------
exports.login = function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  req.session.recoverID = 0;
  if (req.session.userId) { //reroute home if logged in
    return res.redirect('/');
  }
  var msg, er;
  //detect any messages from other pages
  if (typeof req.query.msg !== 'undefined') {
    msg = req.query.msg;
  } else if (typeof req.query.er !== 'undefined') {
    er = [req.query.er];
  }
  return res.render('login', {
    error: er,
    success: msg
  });
};




//------------------------------------signup functionality----------------------------------------------
exports.signup = function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if (req.session.userId) { //reroute home if logged in
    return res.redirect('/');
  }
  return res.render('signup', {});
};




//------------------------------------forgot functionality----------------------------------------------
exports.forgot = function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  if (req.session.userId) { //reroute home if logged in
    return res.redirect('/');
  }
  return res.render('forgot', {});
};




//------------------------------------newPassword functionality----------------------------------------------
exports.newPassword = function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  var msg, er;
  //detect any messages from other pages
  if (typeof req.query.msg !== 'undefined') {
    msg = req.query.msg;
  } else if (typeof req.query.er !== 'undefined') {
    er = [req.query.er];
  }

  req.session.recoverToken = req.params.token;
  return res.render('newPassword', {
    success: msg,
    error: er,
    user: req.session.first_name
  });
};




//------------------------------------logout functionality----------------------------------------------
exports.logout = function (req, res) {
  req.session.destroy(function () {
    return res.redirect('/');
  });
};




//------------------------------------contact_us functionality----------------------------------------------
exports.contact_us = function (req, res) {
  return res.render('contact_us', {
    email: req.session.email,
    user: req.session.first_name
  });
};




//------------------------------------edit_profile functionality----------------------------------------------
exports.edit_profile = function (req, res) {

  //Firstly establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }

    var msg, er;

    if (req.session.userId) {

      //detect any messages from other pages
      if (typeof req.query.msg !== 'undefined') {
        msg = req.query.msg;
      } else if (typeof req.query.er !== 'undefined') {
        er = [req.query.er];
      }

      var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
      var inserts = ['users', 'id', req.session.userId, 'active', 1];
      sql = mysql.format(sql, inserts);

      connection.query(sql, function (err, results) {
        if (err) {
          console.log(err);
          return res.status(500).send(page404_template(req));
        }
        if (results.length === 0) {
          return res.redirect('/logout');

        } else if (results.length === 1) {
          return res.render('edit_profile', {
            success: msg,
            error: er,
            email: results[0].email,
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            contact: results[0].contact,
            user: req.session.first_name
          });
        }
      });

    } else {
      return res.redirect('/logout');
    }
    connection.release();
  });
};



//------------------------------------reset_password functionality----------------------------------------------
exports.reset_password = function (req, res) {

  //Firstly establish db connection
  con.getConnection(function (db_err, connection) {

    if (db_err) { //db connection
      console.log(db_err);
      throw db_err;
    }

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    if (!req.session.userId) { //reroute home if logged in
      return res.redirect('/');
    }
    //initializing sessions used in template
    req.session.recoverToken = req.session.token;
    req.session.recoverFname = req.session.first_name;
    req.session.recoverEmail = req.session.email;

    //------------Start mailing----------------
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
    transporter.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err);
        return res.render('edit_profile', {
          error: ['Sorry, an error occurred. Check internet connection & try again - [512]'],
          email: req.session.email,
          first_name: req.session.first_name,
          last_name: req.session.last_name,
          contact: req.session.contact,
          user: req.session.first_name
        });
      } else {

        //Record token_expiry_date
        sql = "UPDATE ?? SET ?? = CURRENT_TIMESTAMP() WHERE ?? = ?";
        inserts = ['users', 'token_expiry_date', 'email', req.session.email];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (err) {
          if (err) {
            console.log(err);
            return res.status(500).send(page404_template(req));
          }
          console.log('Email sent');
          return res.redirect('/edit_profile?msg=' + encodeURIComponent('An email has been sent to your email with instructions on how to reset your password'));
        });


      }
      connection.release();
    });
  });
  //-----------End Mailing-----------
};