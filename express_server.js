const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
let USERNAME = process.env.USERNAME;
let EMAIL = process.env.EMAIL;
let userCount = 2;
const app = express();
const PORT = process.env.PORT || 8080;
const HOST = 'http://kor.to/';

// MIDDLEWARE
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// 'DATABASES'
const urlDB = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4h3sYs": "http://www.adriandiaz.ca",
  "7t5d4j": "https://www.nytimes.com/",
  "7td6sh": "http://leeselectronic.com/en/",
  "9kuxpa": "http://www.creativeapplications.net/",
  "7dbsd5": "http://fffff.at/"
};
const imgDB = [ 'beach-shorts.jpg', 'dock-shorts.jpg', 'hiker-shorts.jpg', 'mountain-shorts.jpg', 'dirt-shorts.jpg', 'scooter-shorts.jpg', 'hiking-shorts.jpg' ];

const userDB = [{
  id: 0,
  user: USERNAME,
  email: EMAIL,
  memberSince: 1487217051276,
  kortos: 0,
  redirects: 0
}, {
  id: 1,
  user: 'dummy',
  email: 'someone@domain.com',
  memberSince: 1487217051395,
  kortos: 0,
  redirects: 0
}];

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function checkUserDB(key, data) {
  let exists = false;
  userDB.filter(a => {
    if (a[key] === data) {
      exists = true;
    }
    return null;
  });
  if (exists) {
    return false;
  }
  return true;
}

function selectImage() {
  let len = imgDB.length;
  let min = Math.ceil(0);
  let max = Math.floor(len);
  let i = Math.floor(Math.random() * (max - min)) + min;
  return imgDB[i];
}

function generateRandomString() {
  let hash = (Math.random() + 1).toString(36).substring(2, 8);
  while (urlDB.hasOwnProperty(hash)) {
    hash = (Math.random() + 1).toString(36).substring(2, 8);
  }
  return hash;
}


app.get('/', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('landing', {
    random: selectImage(),
    uname: req.cookies["uname"],
    viewLogout: viewLogout,
    viewLogin: viewLogin
  });
});

app.get('/register', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('users_register', {
    random: selectImage(),
    uname: req.cookies["uname"],
    viewLogout: viewLogout,
    viewLogin: viewLogin
  });
});

app.get('/urls', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('urls_index', {
    urls: urlDB,
    random: selectImage(),
    uname: req.cookies["uname"],
    viewLogout: viewLogout,
    viewLogin: viewLogin
  });
});

app.get('/about', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('about', { random: selectImage(), uname: req.cookies["uname"], viewLogout: viewLogout, viewLogin: viewLogin } );
});

app.get('/urls/new', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('urls_new', { random: selectImage(), uname: req.cookies["uname"], viewLogout: viewLogout, viewLogin: viewLogin });
});

app.get('/urls/:id', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.render('urls_show', {
    shortURL: req.params.id,
    random: selectImage(),
    uname: req.cookies["uname"],
    viewLogout: viewLogout,
    viewLogin: viewLogin,
    urls: urlDB,
    host: HOST
  });
});

app.get('/u/:shortURL', (req, res) => {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  if (urlDB.hasOwnProperty(req.params.shortURL)){
    res.redirect(urlDB[req.params.shortURL]);
  } else {
    res.status(404).render('404', { random: selectImage(), uname: req.cookies["uname"], viewLogout: viewLogout, viewLogin: viewLogin });
  }

});

// posts
app.post('/urls', (req, res) => {
  let urlKey = generateRandomString();
  urlDB[urlKey] = req.body.longURL;
  res.redirect(`/urls/${urlKey}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDB[req.params.id];
  res.redirect('/urls');
});

// update url
app.post('/urls/:id', (req, res) => {
  urlDB[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

app.post('/login', (req, res) => {
  console.log(req.body.uname);
  res.cookie('uname', req.body.uname);
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('uname');
  res.redirect('/');
});

app.post('/register', (req, res) => {
  if (!validateEmail(req.body.email)) {
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`<link href="/css/bootstrap.min.css" rel="stylesheet">
      <div class="container" style="margin: auto; max-width: 600px;">
        <div class="panel panel-danger" style="margin: 50px 0 0 0;">
          <div class="panel-heading">
            <h3 class="panel-title">400 Bad Request</h3>
          </div>
          <div class="panel-body">
            <p> The request could not be understood by the server due to malformed syntax. </p>
            <p> The client <strong>SHOULD NOT</strong> repeat the request without modifications.</p>
            <p> <em>RFC 2616 Fielding, et al.</em></p>
            <br />
            <p> Reason: <em>${req.body.email}</em> is not a valid email.</p>
            <button type="button" class="btt btn-danger" onclick="goBack()">Try Again</button>
          </div>
        </div>
      </div>
      <script>
        function goBack() {
            window.history.back();
        }
      </script>
      `));
  } else if (!checkUserDB('email', req.body.email)) {
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`<link href="/css/bootstrap.min.css" rel="stylesheet">
      <div class="container" style="margin: auto; max-width: 600px;">
        <div class="panel panel-danger" style="margin: 50px 0 0 0;">
          <div class="panel-heading">
            <h3 class="panel-title">400 Bad Request</h3>
          </div>
          <div class="panel-body">
            <p> The request could not be understood by the server due to malformed syntax. </p>
            <p> The client <strong>SHOULD NOT</strong> repeat the request without modifications.</p>
            <p> <em>RFC 2616 Fielding, et al.</em></p>
            <br />
            <p> Reason: <em>${req.body.email}</em> already exists!.</p>
            <p class="text-danger"> <strong>Did you forget your password?</strong> Email the site admin for assistance.
          </div>
        </div>
      </div>
      <script>
        function goBack() {
            window.history.back();
        }
      </script>
      `));
  } else if (!checkUserDB('user', req.body.uname)) {
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`<link href="/css/bootstrap.min.css" rel="stylesheet">
      <div class="container" style="margin: auto; max-width: 600px;">
        <div class="panel panel-danger" style="margin: 50px 0 0 0;">
          <div class="panel-heading">
            <h3 class="panel-title">400 Bad Request</h3>
          </div>
          <div class="panel-body">
            <p> The request could not be understood by the server due to malformed syntax. </p>
            <p> The client <strong>SHOULD NOT</strong> repeat the request without modifications.</p>
            <p> <em>RFC 2616 Fielding, et al.</em></p>
            <br />
            <p> Reason: user <em>${req.body.uname}</em> already exists!.</p>
            <p class="text-danger"> <strong>Did you forget your password?</strong> Email the site admin for assistance.
          </div>
        </div>
      </div>
      <script>
        function goBack() {
            window.history.back();
        }
      </script>
      `));
  } else{ res.redirect(400, '/'); }
  // TODO, check empty user or email
});




app.use(function (req, res, next) {
  let viewLogout = 'none';
  let viewLogin = 'inherit';
  if (req.cookies["uname"]) {
    viewLogout = 'inherit';
    viewLogin = 'none';
  }
  res.status(404).render('404', { random: selectImage(), uname: req.cookies["uname"], viewLogout: viewLogout, viewLogin: viewLogin });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});