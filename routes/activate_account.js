//-----------------------------------------------submit_login------------------------------------------------------
const uuidv1 = require('uuid/v1');
const mysql = require('mysql');
const page404_template = require('../routes/page404_template');
const con = require('./db_connect');

exports.activate_account = function (req, res) {

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

    var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
    var inserts = ['users', 'token', req.params.token, 'active', 0];
    sql = mysql.format(sql, inserts);

    connection.query(sql, function (err, results1) {
      if (err) {
        console.log(err);
        return res.status(500).send(page404_template(req));
      }
      if (results1.length === 1) {



        //Calculating time passed after account registration
        var signup_date = new Date(results1[0].signup_date);
        var today = new Date();
        var difference = today - signup_date;
        var minutesPassed = Math.round(difference / 60000) - 120;
        console.log(minutesPassed+' min passed');

        if (minutesPassed > 1440) { //if time up after 24hrs

          sql = "DELETE FROM ?? WHERE ?? = ? and ?? = ?";
          inserts = ['users', 'token', req.params.token, 'active', 0];
          sql = mysql.format(sql, inserts);

          connection.query(sql, function (err, results) {
            if (err) {
              console.log(err);
              return res.status(500).send(page404_template(req));
            }
            return res.redirect('/?er=' + encodeURIComponent('Sorry, but because of security issues we can not allow you to activate your account after 24hrs. Please create your account again. Again we\'re very sorry.'));
          });


        } else { //if acc activation window still open

          //change Token
          const token = uuidv1();

          sql = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ? and ?? = ?";
          inserts = ['users', 'token', token, 'active', 1, 'token', req.params.token, 'active', 0];
          sql = mysql.format(sql, inserts);

          connection.query(sql, function (err, results) {
            if (err) {
              console.log(err);
              return res.status(500).send(page404_template(req));
            }

            req.session.userId = results1[0].id;
            req.session.first_name = results1[0].first_name;
            req.session.last_name = results1[0].last_name;
            req.session.email = results1[0].email;
            req.session.contact = results1[0].contact;
            req.session.token = results1[0].token;

            console.log(req.session.first_name + ' is in...');
            return res.redirect('/?msg=' + encodeURIComponent('You\'re in! Account activation successful'));
          });
        } //end time check

      } else {
        return res.render('login', {
          error: ['Account is either already activated or the URL is wrong - [501]']
        });
      }
    });
    connection.release();
  });

};