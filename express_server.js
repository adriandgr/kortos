const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const dateFormat = require('dateformat');
const md5 = require("blueimp-md5");
const methodOverride = require('method-override');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
// SECURITY MANIFEST | 10 sR: 0.069s | 11 sR: 0.139s | 12 sR: 0.272s | 13 sR: 0.548s | 14 sR: 1.1s | 15 sR: 2.18s | 16 sR: 4.366s | 17 sR: 8.731s | 18 sR: 17.475s
const saltRounds = 12;

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = 'http://localhost';

// MIDDLEWARE
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'development'],
  maxAge: 90 * 24 * 60 * 60 * 1000
}));

app.use(function (req, res, next) {
  req.session.nowInMinutes = Date.now() / 60e3;
  next();
});

// 'DATABASES'
const urlDB = {
  "b2xVn2": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "http://www.lighthouselabs.ca", dateAdded: "2/17/17"},
  "9sm5xK": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "http://www.google.com", dateAdded: "2/16/17"},
  "4h3sYs": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://www.fewblocks.ca", dateAdded: "4/9/16"},
  "7t5d4j": { ownerId: "t7v1g5DO4dM82tqHvVQd5O", url: "https://www.nytimes.com/", dateAdded: "2/17/17"},
  "7td6sh": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://leeselectronic.com/en/", dateAdded: "1/23/17"},
  "9kuxpa": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://www.creativeapplications.net/", dateAdded: "2/17/17"},
  "7dbsd5": { ownerId: "bjdG7Qmhwkn5Hb8OmCUk6u", url: "http://fffff.at/", dateAdded: "2/14/17"},
  "wxekf3": { ownerId: (process.env.KORTOS_ID || "dev"), url: (process.env.GRAVATAR || "dev"), dateAdded: "2/17/17"},
  "aeledu": { ownerId: (process.env.KORTOS_ID || "dev"), url: "https://www.gravatar.com/avatar/676a33bd3be95b9cb7af4bab37d1ea44?s=250&d=identicon", dateAdded: "2/17/17"}
};
const imgDB = [ 'beach-shorts.jpg', 'dock-shorts.jpg', 'hiker-shorts.jpg', 'mountain-shorts.jpg', 'dirt-shorts.jpg', 'scooter-shorts.jpg', 'hiking-shorts.jpg', 'coffee-shorts.jpg', 'dramatic-shorts.jpg', 'runner-shorts.jpg' ];

const users = {
  "bjdG7Qmhwkn5Hb8OmCUk6u": {
    id: "bjdG7Qmhwkn5Hb8OmCUk6u",
    user: (process.env.USERNAME || "dev"),
    email: (process.env.EMAIL || "dev"),
    avatar: `${HOST}:${PORT}/u/wxekf3`,
    password: "$2a$12$bjdG7Qmhwkn5Hb8OmCUk6u/ia.o6JV1iGuvY0KrHzWeGS.A4mGcOW",
    memberSince: "2/13/17",
    kortoCount: 4,
    redirectCount: 0
  },
  "t7v1g5DO4dM82tqHvVQd5O": {
    id: "t7v1g5DO4dM82tqHvVQd5O",
    user: "Lolo",
    email: "lolo@realemail.ca",
    avatar: `${HOST}:${PORT}/u/aeledu`,
    // try: correct horse battery staple
    password: "$2a$12$t7v1g5DO4dM82tqHvVQd5OxJA27vVQAV5L0maF3M5FGf.3i0dqSoS",
    memberSince: "2/15/17",
    kortoCount: 3,
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
    if (users[user][prop] === check) {
      return true;
    }
  }
  return false;
}

function getUserId(prop, check) {
  for (user in users){
    if (users[user][prop] === check) {
      return users[user].id;
    }
  }
  return false;
}

function addUriProtocol(uri){
  var re = new RegExp("^https?://", "i");
  if (re.test(uri)) {
    return uri;
  }
  return `http://${uri}`;
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


// GET routes

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if(req.session.userId){
    res.redirect('/');
  } else {
    res.render('users_login', {
      random: selectImage(),
      user: {}
    });
  }
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    res.redirect('/');
    return;
  }
  res.render('users_register', {
    random: selectImage(),
    user: {}
  });
});

app.get('/urls', (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const userEmail = users[userId].email;
    const userKortos = {};
    for ( let key in urlDB) {
      if (urlDB[key].ownerId === userId) {
        userKortos[key] = urlDB[key];
      }
    }
    res.render('urls_index', {
      urlIds: userKortos,
      random: selectImage(),
      user: users[userId]
    });
  } else {
    res.status(401).render('statuses', { status: {
      code: '401 Unauthorized',
      reason: 'you are not logged in.',
      forgot: false }});
  }
});

app.get('/about', (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const userEmail = users[userId].email;
    res.render('about', { random: selectImage(), user: users[userId] });
  } else {
    res.render('about', { random: selectImage(), user: {} });
  }
});

app.get('/:username', (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const userEmail = users[userId].email;
    if (users[userId].user.toLowerCase() === req.params.username.toLowerCase() ) {
      res.render('users_profile', { random: selectImage(), user: users[userId] });
    } else {
      res.status(404).render('statuses', { status: {
        code: '404 Not Found',
        reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
        forgot: false }});
    }
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const userEmail = users[userId].email;
    res.render('urls_new', { random: selectImage(), user: users[userId] });
  } else {
    res.status(401).render('statuses', { status: {
      code: '401 Unauthorized',
      reason: 'you are not logged in.',
      forgot: false }});
  }
});

app.get('/urls/:id', (req, res) => {
  if (req.session.userId) {
    const userId = req.session.userId;
    const userEmail = users[userId].email;
    if (urlDB.hasOwnProperty(req.params.id)) {
      if (urlDB[req.params.id].ownerId === userId) {
        res.render('urls_show', {
          shortURL: req.params.id,
          random: selectImage(),
          user: users[userId],
          urls: urlDB,
          host: HOST
        });
      } else {
        res.status(403).render('statuses', { status: {
          code: '403 Forbidden',
          reason: `${HOST}${req._parsedUrl.path.substring(1)}`,
          forgot: false }});
      }
    } else {
      res.status(404).render('statuses', { status: {
        code: '404 Not Found',
        reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
        forgot: false }});
    }
  } else {
    if (!urlDB.hasOwnProperty(req.params.id)) {
      res.status(404).render('statuses', { status: {
        code: '404 Not Found',
        reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
        forgot: false }});
    } else {
      res.status(401).render('statuses', { status: {
        code: '401 Unauthorized',
        reason: 'you are not logged in.',
        forgot: false }});
    }
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDB.hasOwnProperty(req.params.shortURL)){
    if(req.session.visitorId) {
      const ownerId = urlDB[req.params.shortURL].ownerId;
      urlDB[req.params.shortURL].redirects[req.session.visitorId] += 1;
      users[ownerId].redirectCount += 1;
    } else {
      req.session.visitorId = generateRandomString();
      urlDB[req.params.shortURL].redirects[req.session.visitorId] = urlDB.redirects[req.session.visitorId] || 1;
      users[ownerId].redirectCount += 1;
    }
    res.redirect(urlDB[req.params.shortURL].url);
  } else {
    res.status(404).render('statuses', { status: {
      code: '404 Not Found',
      reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
      forgot: false }});
  }
});

// DELETE routes

app.delete('/urls/:id', (req, res) => {
  if (req.session.userId) {
    delete urlDB[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(401).render('statuses', { status: {
      code: '401 Unauthorized',
      reason: 'you are not logged in.',
      forgot: false }});
  }
});

// POST routes

app.post('/urls', (req, res) => {
  if (req.session.userId) {
    const urlKey = generateRandomString();
    const uri = addUriProtocol(req.body.longURL);
    urlDB[urlKey] = {
      ownerId: req.session.userId,
      url: uri,
      dateAdded: dateFormat(Date.now(), "m/d/yy"),
      redirects: 0
    };
    users[req.session.userId].kortoCount += 1;
    res.redirect(`/urls/${urlKey}`);
  } else {
    res.status(403).render('statuses', { status: {
      code: '403 Forbidden',
      reason: `${HOST}${req._parsedUrl.path.substring(1)}`,
      forgot: false }});
  }
});

app.post('/urls/:id', (req, res) => {
  if (!urlDB.hasOwnProperty(req.params.id)){
    res.status(404).render('statuses', { status: {
      code: '404 Not Found',
      reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
      forgot: false }});
  } else {
    if (req.session.userId) {
      if(req.session.userId === urlDB[req.params.id].ownerId) {
        urlDB[req.params.id].url = addUriProtocol(req.body.longURL);
        urlDB[req.params.id].editCount = (urlDB[req.params.id].editCount || 0) + 1;
        res.redirect(`/urls/${req.params.id}`);
      } else {
        res.status(403).render('statuses', { status: {
          code: '403 Forbidden',
          reason: `${HOST}${req._parsedUrl.path.substring(1)}`,
          forgot: false }});
      }
    } else {
      res.status(401).render('statuses', { status: {
        code: '401 Unauthorized',
        reason: 'you are not logged in.',
        forgot: false }});
    }
  }
});

app.post('/login', (req, res) => {
  if (propertyExists('email', req.body.email)){
    const userId = getUserId('email', req.body.email);
    bcrypt.compare(req.body.password, users[userId].password, function(err, pass) {
      if (pass) {
        req.session.userId = users[userId].id;
        res.redirect('/');
      } else {
        res.status(400).render('statuses', { status: {
          code: '400 Bad Request',
          reason: `authentication failure`,
          forgot: true }});
      }
    });
  } else {
    res.status(400).render('statuses', { status: {
      code: '400 Bad Request',
      reason: `authentication failure`,
      forgot: true }});
  }
});

app.post('/logout', (req, res) => {
  delete req.session.userId;
  res.redirect('/');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password){
    res.status(400).render('statuses', { status: {
      code: '400 Bad Request',
      reason: `Email and password fields are required and may not be left blank.`,
      forgot: false }});
  } else if (!validateEmail(req.body.email)) {
    res.status(400).render('statuses', { status: {
      code: '400 Bad Request',
      reason: `${req.body.email} is not a valid email address.`,
      forgot: false }});
  } else if (propertyExists('email', req.body.email)) {
    res.status(400).render('statuses', { status: {
      code: '400 Bad Request',
      reason: `${req.body.email} is already registered!`,
      forgot: true }});
  }  else {
    bcrypt.genSalt(saltRounds, function(err, salt) {
      // TODO: check to see if salt already exists in userDB
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        const id = salt.substring(7);
        const gravatarId = md5(req.body.email);
        const gravatarUri = `https://www.gravatar.com/avatar/${gravatarId}?s=250&d=identicon`;
        const kortoID = generateRandomString();
        urlDB[kortoID] = {
          ownerId: (process.env.KORTOS_ID || "dev"),
          url: gravatarUri,
          dateAdded: dateFormat(Date.now(), "m/d/yy"),
          type: 'user_avatar'
        };
        users[id] = {
          id: id,
          user: req.body.user,
          email: req.body.email,
          avatar: `${HOST}:${PORT}/u/${kortoID}`,
          password: hash,
          memberSince: dateFormat(Date.now(), "m/d/yy"),
          kortoCount: 0,
          redirectCount: 0
        };
        req.session.userId = id;
        res.redirect('/');
      });
    });
  }
});

app.post('/update/:id', (req, res) => {
  // check: no user logged in
  console.log("got a POST req!!");
  if(!req.session.userId) {
    res.status(401).render('statuses', { status: {
      code: '401 Unauthorized',
      reason: 'you are not logged in.',
      forgot: false }});
  } else {
    const userId = req.session.userId;
    // check: user logged in does not match target resource owner
    if (userId !== req.params.id) {
      res.status(403).render('statuses', { status: {
        code: '403 Forbidden',
        reason: `${HOST}${req._parsedUrl.path.substring(1)}`,
        forgot: false }});
    } else {
      // check: new email does not collide with existing users
      if (propertyExists('email', req.body.email) && (req.body.email !== users[userId].email)) {
        res.status(400).render('statuses', { status: {
          code: '400 Bad Request',
          reason: `${req.body.email} is already registered!`,
          forgot: false }});
      } else {
        // check: verify password provided
        bcrypt.compare(req.body.password, users[userId].password, function(err, pass) {
          // SUCCESS! Go ahead and update profile
          if (pass) {
            // check: url string has changed
            if (req.body.avatar !== users[userId].avatar) {
              // check: url string is 30 characters long, if true, assume it is a korto link.
              if(req.body.avatar.length === 30) {
                users[userId].avatar = reg.body.avatar;
              } else {
                const longUri = addUriProtocol(req.body.avatar);
                const kortoID = generateRandomString();

                urlDB[kortoID] = {
                  ownerId: (process.env.KORTOS_ID || "dev"),
                  url: `${longUri}`,
                  dateAdded: dateFormat(Date.now(), "m/d/yy"),
                  type: 'user_avatar'
                };
                // UPDATE: new profile picture url as a short link
                users[userId].avatar = `${HOST}:${PORT}/u/${kortoID}`;
              }
            }
          // ^end of url condition

            // check: new password is different
            bcrypt.compare(req.body.newPassword, users[userId].password, function(err, pass) {
              if (pass) {
                // check: password is the same, do nothing
              } else {
                bcrypt.hash(req.body.newPassword, saltRounds, function(err, hash) {
                  // UPDATE: new hash in user DB.
                  users[userId].password = hash;
                });
              }
            });
          // ^end of password condition

            // UPDATE OPTIMISTICALLY: user (name), email (safe), and about

            users[userId].user = req.body.name;
            users[userId].email = req.body.email;
            users[userId].about = req.body.about;
            console.log(users[userId]);
            // Done updating user
            res.redirect(`/${users[userId].user}`);
          } else {
            // AUTH FAILURE: Reject request
            res.status(400).render('statuses', { status: {
              code: '400 Bad Request',
              reason: `authentication failure`,
              forgot: true }});
          }
        });
      }
    }
  }
});

app.use(function (req, res, next) {
  res.status(404).render('statuses', { status: {
    code: '404 Not Found',
    reason: `${HOST}:${PORT}/${req._parsedUrl.path.substring(1)}`,
    forgot: false }});
});

app.listen(PORT, () => {
  console.log(`Kortōs app is listening on port ${PORT}!`);
});