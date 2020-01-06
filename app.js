//Sourcing JS Modules
const express = require('express'),
    router = require('./routes/router'),
    signup_post = require('./routes/signup_post'),
    login_post = require('./routes/login_post'),
    contact_us_post = require('./routes/contact_us_post'),
    activate_account = require('./routes/activate_account'),
    forgot_post = require('./routes/forgot_post'),
    newPassword_post = require('./routes/newPassword_post'),
    edit_profile_post = require('./routes/edit_profile_post'),
    path = require('path'),
    mysql = require('mysql'),
    session = require('express-session'),
    bodyParser = require("body-parser"),
    nodemailer = require('nodemailer');

const {
    check,
    validationResult
} = require('express-validator');
const app = express();
const port = process.env.PORT || 8010;

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use(express.static(__dirname + '/public'));

//-Initialize memory unleaked cookies---------
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    secure: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 //30 days
    }
}));

//db connection
require('./routes/db');
const con = require('./routes/db_connect');

//ROUTING
app.get('/', router.index);


//login-----------------------------------------
app.get('/login', router.login);
app.post('/login', [
    check('email').not().isEmpty().isEmail().trim().escape().normalizeEmail().withMessage('Incorrect Credentials'),
    check('password').not().isEmpty().isLength({
        min: 5
    }).withMessage('Incorrect Credentials')
], login_post.login_post);


//contact_us-----------------------------------------
app.get('/contact_us', router.contact_us);
app.post('/contact_us', [
    check('email').isEmail().trim().escape().normalizeEmail().withMessage('Please provide correct email address.'),
    check('subject').isLength({
        min: 3,
        max: 30
    }).trim().escape().withMessage('Please provide a subject'),
    check('body').isLength({
        min: 3,
        max: 500
    }).trim().escape().withMessage('Please type correct message in the body section')
], contact_us_post.contact_us_post);


//logout-----------------------------------------
app.get('/logout', router.logout);


//signup-----------------------------------------
app.get('/signup', router.signup);
app.post('/signup', [
    check('first_name').isLength({
        min: 3,
        max: 20
    }).trim().escape().withMessage('Please provide correct first name with at least 3 letters'),
    check('last_name').isLength({
        min: 3,
        max: 20
    }).trim().escape().withMessage('Please provide correct last name with at least 3 letters'),
    check('contact').isLength({
        min: 10,
        max: 10
    }).withMessage('Please provide 10 digit phone number.'),
    check('contact').isInt().trim().escape().withMessage('Please provide valid phone number.'),
    check('email').isEmail().trim().escape().normalizeEmail().withMessage('Please provide correct email address.'),
    check('password').isLength({
        min: 5
    }).withMessage('Password must have at least 5 characters'),
    check('rpassword').custom((value, {
        req
    }) => (value === req.body.password)).withMessage('Passwords do not match')
], signup_post.signup_post);


//edit_profile-----------------------------------------
app.get('/edit_profile', router.edit_profile);
app.post('/edit_profile', [
    check('first_name').isLength({
        min: 3,
        max: 20
    }).trim().escape().withMessage('Please provide correct first name with at least 3 letters'),
    check('last_name').isLength({
        min: 3,
        max: 20
    }).trim().escape().withMessage('Please provide correct last name with at least 3 letters'),
    check('contact').isLength({
        min: 10,
        max: 10
    }).withMessage('Please provide 10 digit phone number.'),
    check('contact').isInt().trim().escape().withMessage('Please provide valid phone number.')
], edit_profile_post.edit_profile_post);


//newPassword from email with token param-----------------------------------------
app.get('/newPassword/:token', router.newPassword);
app.post('/newPassword', [
    check('password').not().isEmpty().withMessage('Provide valid passwords'),
    check('password').isLength({
        min: 5
    }).withMessage('Password must have at least 5 characters'),
    check('rpassword').custom((value, {
        req
    }) => (value === req.body.password)).withMessage('Passwords do not match')
], newPassword_post.newPassword_post);


//forgot-----------------------------------------
app.get('/forgot', router.forgot);
app.post('/forgot', [
    check('email').not().isEmpty().isEmail().trim().escape().normalizeEmail().withMessage('Invalid Email')
], forgot_post.forgot_post);


//activate_account-----------------------------------------
app.get('/activate_account/:token', activate_account.activate_account);


//reset_password-----------------------------------------
app.get('/reset_password', router.reset_password);


//Middleware running server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});






//Smart way of handling ERRORS via emails---------------------------
var page404_template = require('./routes/page404_template');
app.use(function (err1, req, res, next) {

    //Firstly establish db connection
    con.getConnection(function (db_err, connection) {

        if (db_err) { //db connection
            console.log(db_err);
            throw db_err;
        }

        let edited_error = err1.stack;
        edited_error = edited_error.replace(/['"]+/g, '');

        var sql = "SELECT * FROM ?? WHERE ?? = ?";
        var inserts = ['errors', 'bug', edited_error];
        sql = mysql.format(sql, inserts);

        connection.query(sql, function (err2, results) {
            if (err2) {
                console.log(err2);
                throw err2;
            }
            if (results.length === 0) {

                sql = "INSERT INTO ?? (`bug`) VALUES (?)";
                inserts = ['errors', edited_error];
                sql = mysql.format(sql, inserts);

                connection.query(sql, function (err3, result) {
                    if (err3) {
                        console.log(err3);
                        throw err3;
                    }

                    //------------Start mailing----------------------------
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });
                    const mailOptions = {
                        from: 'Error Handler <www.villagesavers.com>', // sender address
                        to: process.env.EMAIL, // list of receivers
                        subject: 'System Bug', // Subject line
                        html: edited_error // load html template
                    };
                    transporter.sendMail(mailOptions, function (err4, info) {
                        if (err4) {
                            console.log(err4);
                            req.sendStatus(555);
                        } else {
                            console.log('Bug reported');
                            req.sendStatus(200);
                        }
                    });
                    //-----------End Mailing----------------------------------

                });
                console.error(err1.stack);
                res.status(500).send(page404_template(req));
            } else {
                console.error('Bug already reported');
                console.error(err1.stack);
                res.status(500).send(page404_template(req));
            }
        });
        connection.release();
    });
});