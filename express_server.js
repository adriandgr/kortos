const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
// SECURITY MANIFEST | 10 sR: 0.069s | 11 sR: 0.139s | 12 sR: 0.272s | 13 sR: 0.548s | 14 sR: 1.1s | 15 sR: 2.18s | 16 sR: 4.366s | 17 sR: 8.731s | 18 sR: 17.475s
const saltRounds = 12;

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = 'http://kor.to/';


//todo, install bcrypt

// MIDDLEWARE
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'development'],
  // Cookie Options
  maxAge: 4 * 60 * 60 * 1000
}));

app.use(function (req, res, next) {
  req.session.nowInMinutes = Date.now() / 60e3;
  next();
});

let userCount = 2;
// 'DATABASES'
const urlDB = {
  "b2xVn2": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "http://www.lighthouselabs.ca" },
  "9sm5xK": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "http://www.google.com" },
  "4h3sYs": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://www.adriandiaz.ca" },
  "7t5d4j": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "https://www.nytimes.com/" },
  "7td6sh": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://leeselectronic.com/en/" },
  "9kuxpa": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://www.creativeapplications.net/" },
  "7dbsd5": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://fffff.at/" }
};
const imgDB = [ 'beach-shorts.jpg', 'dock-shorts.jpg', 'hiker-shorts.jpg', 'mountain-shorts.jpg', 'dirt-shorts.jpg', 'scooter-shorts.jpg', 'hiking-shorts.jpg' ];

const users = {
  "id": {
    "password": "please be serious"
  },
  "0": {
    id: 0
  },
  "bjdG7Qmhwkn5Hb8OmCUk6u": {
    id: "bjdG7Qmhwkn5Hb8OmCUk6u",
    user: process.env.USERNAME,
    email: process.env.EMAIL,
    password: "$2a$12$bjdG7Qmhwkn5Hb8OmCUk6u/ia.o6JV1iGuvY0KrHzWeGS.A4mGcOW",
    memberSince: 1487217051276,
    kortoCount: 0,
    redirectCount: 0
  },
  "t7v1g5DO4dM82tqHvVQd5O": {
    id: "t7v1g5DO4dM82tqHvVQd5O",
    user: "Lolo",
    email: "lolo@realemail.ca",
    // try: correct horse battery staple
    password: "$2a$12$t7v1g5DO4dM82tqHvVQd5OxJA27vVQAV5L0maF3M5FGf.3i0dqSoS",
    memberSince: 1487217051395,
    kortoCount: 0,
    redirectCount: 0
  }
};


function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function propertyExists(prop, check) {
  let exists = false;
  for (user in users){
    console.log(`comparing <${users[user][prop]}> === <${check}> >>> ${users[user][prop] === check}`);
    if (users[user][prop] === check) {
      return true;
    }
  }
  return false;
}
function getUserId(prop, check) {
  for (user in users){
    console.log(`comparing <${users[user][prop]}> === <${check}> >>> ${users[user][prop] === check}`);
    if (users[user][prop] === check) {
      return users[user].id;
    }
  }
  return false;
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
  console.log(req.session);
  console.log(`\ncurrent session user is ${req.session.user}\n`);

  console.log('users', users);


  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  console.log('id', id);
console.log('users[id]', users[id]);

  res.render('landing', {
    random: selectImage(),
    user: req.session.user,
    username: (users[id]|| {}).user
  });
  // let username = 0;
  // if (req.session.user) {
  //   let id = req.session.user;
  //   username = users[id].user;
  // }
  // res.render('landing', {
  //   random: selectImage(),
  //   user: req.session.user,
  //   username: username
  // });
});

app.get('/register', (req, res) => {
  console.log(`\ncurrent session cookie is ${req.session.user}\n`);
  console.log(req.session.user)

  if (req.session.user) {
    res.redirect('/urls');
    return;
  }
  res.render('users_register', {
    random: selectImage(),
    user: null,
  });
});

app.get('/urls', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  res.render('urls_index', {
    urlIds: urlDB,
    random: selectImage(),
    user: req.session.user,
    username: users[id].user
  });
});

app.get('/about', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  res.render('about', { random: selectImage(), user: req.session.user, username: users[id].user } );
});

app.get('/:user', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  res.render('users_profile', { random: selectImage(), user: req.session.user, username: users[id].user } );
});

app.get('/urls/new', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  res.render('urls_new', { random: selectImage(), user: req.session.user, username: users[id].user });
});

app.get('/urls/:id', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  res.render('urls_show', {
    shortURL: req.params.id,
    random: selectImage(),
    user: req.session.user,
    username: users[id].user,
    urls: urlDB,
    host: HOST
  });
});

app.get('/u/:shortURL', (req, res) => {
  let id = 0;
  if (req.session.user) {
    id = req.session.user;
  }
  if (urlDB.hasOwnProperty(req.params.shortURL)){
    res.redirect(urlDB[req.params.shortURL].url);
  } else {
    res.status(404).render('404', { random: selectImage(), user: req.session.user, username: users[id].user });
  }

});

// posts
app.post('/urls', (req, res) => {
  if (req.session.user) {
    let urlKey = generateRandomString();
    urlDB[urlKey] = {
      ownerId: req.session.user,
      url: req.body.longURL
    };
    res.redirect(`/urls/${urlKey}`);
  } else {
    res.status(403).json({ error: 'You must be logged in' });
  }
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

  console.log(req.body);
  if (propertyExists('email', req.body.email)){
    id = getUserId('email', req.body.email);
    console.log('id', id);
    console.log('users.id', users.id);
    console.log('req.body', req.body);
    console.log('users.id.password', users.id.password);
    console.log('req.body.password', req.body.password);

    bcrypt.compare(req.body.password, users[id].password, function(err, res) {
      // res == true
      if (res) {
        //req.session.user = req.body.user;
        console.log("should set a cookie!");
        res.redirect('/');
      }
    });


  } else {
    res.status(400).send('wrong credentials');
  }
});

app.post('/logout', (req, res) => {
  delete req.session.user;
  res.redirect('/');
});

app.post('/register', (req, res) => {
  console.log("REGISTER!\n");

  console.log("DATA IN\n", req.body);
  if (!validateEmail(req.body.email)) {
    console.log("BAD EMAIL!\n");
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`${process.env.PRE_BAD_EMAIL}${req.body.email}${process.env.POST_BAD_EMAIL}`));

  } else if (propertyExists('email', req.body.email)) {
    console.log("EMAIL EXISTS!\n");
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`${process.env.PRE_EMAIL_EXISTS}${req.body.email}${process.env.POST_EMAIL_EXISTS}`));

  } else if (propertyExists('user', req.body.user)) {
    console.log("USER EXISTS!\n");
    res.set('Content-Type', 'text/html');
    res.status(400).send(new Buffer(`${process.env.PRE_USER_EXISTS}${req.body.user}${process.env.POST_USER_EXISTS}`));

  } else {
    bcrypt.genSalt(saltRounds, function(err, salt) {
      // TODO: check to see if salt already exists in userDB
      console.log(`salting user ${req.body.user} >> ${salt}`)
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        let id = salt.substring(7);
        users[id] = {
          id: id,
          user: req.body.user,
          email: req.body.email,
          password: hash,
          memberSince: Date.now(),
          kortoCount: 0,
          redirectCount: 0
        }
        console.log(users[id]);
        req.session.user = id;
        res.redirect('/');
          // Store hash in your password DB.
      });
    });


    }

});


app.use(function (req, res, next) {
  let viewIfUser = 'none';
  let viewIfAnon = 'inherit';
  if (req.session["user"]) {
    viewIfUser = 'inherit';
    viewIfAnon = 'none';
  }
  res.status(404).render('404', { random: selectImage(), user: req.session["user"], viewIfUser: viewIfUser, viewIfAnon: viewIfAnon });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});