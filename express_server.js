let express = require('express');
const bodyParser = require('body-parser');
let app = express();
let PORT = process.env.PORT || 8080;
const HOST = 'http://kor.to/';

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "4h3sYs": "http://www.adriandiaz.ca"
};

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let hash = (Math.random()+1).toString(36).substring(2,8);
  while (urlDatabase.hasOwnProperty(hash)) {
    hash = (Math.random()+1).toString(36).substring(2,8);
  }
  return hash;
}

const imgBackgrounds = [ 'beach-shorts.jpg', 'dock-shorts.jpg', 'hiker-shorts.jpg', 'mountain-shorts.jpg', 'dirt-shorts.jpg', 'scooter-shorts.jpg', 'hiking-shorts.jpg' ];

function selectImage() {
  let len = imgBackgrounds.length;
  let min = Math.ceil(0);
  let max = Math.floor(len);
  let i = Math.floor(Math.random() * (max - min)) + min;
  return imgBackgrounds[i];
}

app.get('/', (req, res) => {
  res.render('landing', { random: selectImage() });
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    random: selectImage()
  };
  res.render('urls_index', templateVars);
});

app.get('/about', (req, res) => {
  res.render('about', { random: selectImage() } );
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new', { random: selectImage() });
});

app.get('/urls/:id', (req, res) => {
  res.render('urls_show', {
    shortURL: req.params.id,
    random: selectImage(),
    urls: urlDatabase,
    host: HOST
  });
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)){
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    res.status(404).render('404');
  }

});

// posts
app.post('/urls', (req, res) => {
  let urlKey = generateRandomString();
  urlDatabase[urlKey] = req.body.longURL;
  res.redirect(`/urls/${urlKey}`);
});

app.post('/urls/:id/delete', (req, res) => {
  res.send('hello')
});

app.use(function (req, res, next) {
  res.status(404).render('404');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});