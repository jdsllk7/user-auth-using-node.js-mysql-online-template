//-----------------------------------------------submit_login------------------------------------------------------
var page404_template = function (req) {

  return ` 

  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  
    <title>VillageSavers | 404</title>
  
    <!-- Google font -->
    <link href="https://fonts.googleapis.com/css?family=Montserrat:200,400,700" rel="stylesheet">
  
  
    <style>
      * {
      -webkit-box-sizing: border-box;
          box-sizing: border-box;
    }
  
    body {
      padding: 0;
      margin: 0;
    }
  
    #notfound {
      position: relative;
      height: 100vh;
    }
  
    #notfound .notfound {
      position: absolute;
      left: 50%;
      top: 35%;
      -webkit-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
    }
    p{
      color: #009345;
      font-size: 1.3em;
    }
    .notfound {
      max-width: 520px;
      width: 100%;
      line-height: 1.4;
      text-align: center;
    }
  
    .notfound .notfound-404 {
      position: relative;
      height: 200px;
      margin: 0px auto 20px;
      z-index: -1;
    }
  
    .notfound .notfound-404 h1 {
      font-family: 'Montserrat', sans-serif;
      font-size: 236px;
      font-weight: 200;
      margin: 0px;
      color: #211b19;
      text-transform: uppercase;
      position: absolute;
      left: 50%;
      top: 50%;
      -webkit-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
    }
  
    .notfound .notfound-404 h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 400;
      text-transform: uppercase;
      color: #211b19;
      background: #fff;
      padding: 10px 5px;
      margin: auto;
      display: inline-block;
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0;
    }
  
    .notfound a {
      font-family: 'Montserrat', sans-serif;
      display: inline-block;
      font-weight: 700;
      text-decoration: none;
      color: #fff;
      text-transform: uppercase;
      padding: 13px 23px;
      background: #009345;
      font-size: 18px;
      -webkit-transition: 0.2s all;
      transition: 0.2s all;
    }
  
    .notfound a:hover {
      color: #009345;
      background: #f2f2f2;
    }
  
    @media only screen and (max-width: 767px) {
      .notfound .notfound-404 h1 {
      font-size: 148px;
      }
    }
  
    @media only screen and (max-width: 480px) {
      .notfound .notfound-404 {
      height: 148px;
      margin: 0px auto 10px;
      }
      .notfound .notfound-404 h1 {
      font-size: 86px;
      }
      .notfound .notfound-404 h2 {
      font-size: 16px;
      }
      .notfound a {
      padding: 7px 15px;
      font-size: 14px;
      }
    }
  
    </style>
    
    <link rel='stylesheet' href='/stylesheets/style.css' />
      <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" />
      <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
  
      <!-- browser icons -->
      <link rel="icon" href="/public/images/logo.jpg">
  
  </head>
  
  <body>
  <div class="container">
  <!-- Static navbar -->
      <nav class="navbar navbar-default">
        <div class="container-fluid">
          <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
              <li class=""><a href="/">Home</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right">
              <li><a href="/contact_us">Contact us</a></li>
            </ul>
          </div>
          <!--/.nav-collapse -->
        </div>
        <!--/.container-fluid -->
      </nav>
  
  
  
    <div id="notfound">
      <div class="notfound">
        <div class="notfound-404">
          <h1>Oops!</h1>
          <h2>Error - The Page can't load</h2>
          
        </div>
        <p>We're so sorry you've had to see this. We've taken note of this problem and are already working round the clock to fix it...</p>
        <br><br>
        <a href="/">GO BACK HOME</a>
      </div>
    </div>
  
      </div>
    </body>
  </html><!-- This templates was made by Colorlib (https://colorlib.com) -->
  


    `;

};

module.exports = page404_template;