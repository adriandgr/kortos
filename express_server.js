const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
  res.cookie('uname', req.body.uname);
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  res.clearCookie('uname');
  res.redirect('/');
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