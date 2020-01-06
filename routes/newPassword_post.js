//---------------------------------------------newPassword------------------------------------------------------
const uuidv1 = require('uuid/v1');
const bcrypt = require('bcryptjs');
const page404_template = require('../routes/page404_template');

const {
    check,
    validationResult
} = require('express-validator');

const mysql = require('mysql');
const con = require('./db_connect');

exports.newPassword_post = function (req, res) {

    //Firstly establish db connection
    con.getConnection(function (db_err, connection) {

        if (db_err) { //db connection
            console.log(db_err);
            throw db_err;
        }

        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

        if (req.method === "POST") {
            var post = req.body,
                pass = post.password;


            //Start form validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                var output = [];
                for (var i = 0; i < errors.array().length; i++) {
                    output.push(errors.array()[i].msg);
                }

                return res.render('newPassword', {
                    error: output,
                    user: req.session.first_name
                });

            } else {

                var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? = ?";
                var inserts = ['users', 'token', req.session.recoverToken, 'active', 1];
                sql = mysql.format(sql, inserts);

                connection.query(sql, function (err, results) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(page404_template(req));
                    }

                    if (results.length === 1) {

                        //Calculating time passed after account registration
                        var token_created_date = new Date(results[0].token_expiry_date);
                        var today = new Date();
                        var difference = today - token_created_date;
                        var minutesPassed = Math.round(difference / 60000) - 120;
                        console.log(minutesPassed + ' min passed');

                        if (minutesPassed > 1440) { //if time up after 24hrs
                            return res.redirect('/?er=' + encodeURIComponent('Sorry, but because of security issues we can not allow you to reset your password after 24hrs. Please request a password reset again. Again we\'re very sorry.'));

                        } else { //if acc activation window still open

                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(pass, salt, function (err, hash) {

                                    //change Token
                                    const token = uuidv1();

                                    sql = "UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ? and ?? = ?";
                                    inserts = ['users', 'password', hash, 'token', token, 'token', req.session.recoverToken, 'active', 1];
                                    sql = mysql.format(sql, inserts);

                                    connection.query(sql, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(page404_template(req));
                                        }
                                        if (!req.session.userId) {
                                            return res.redirect('/login?msg=' + encodeURIComponent('Password reset successful'));
                                        } else {
                                            return res.redirect('/?msg=' + encodeURIComponent('Password reset successful'));
                                        }

                                    });
                                });
                            });
                        } //end time check

                    } else {
                        return res.redirect('/?er=' + encodeURIComponent('Sorry, but seems this \'Password reset request\' was already attended to'));
                    }

                });

            } //end form validation

        } else {
            return res.render('newPassword', {
                error: ['Sorry, an error occurred while resetting your password. Check internet connection & try again - [511]'],
                user: req.session.first_name
            });
        }
        connection.release();
    });
};