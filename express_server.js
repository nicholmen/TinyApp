const bcrypt = require('bcrypt');
const express = require('express');
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080

// The body-parser library will allow us to access POST request parameters, such as req.body.longURL,
// which we will store in a variable called urlDatabase
const randomstring = require("randomstring");
const bodyParser = require("body-parser");
let cookieSession = require("cookie-session");


let urlDatabase = {
  "b2xVn2": {
    "url": "http://www.lighthouselabs.ca",
    "user_id": "userRandomID",
  },
  "9sm5xK": {
    "url": "http://www.google.com",
    "user_id": "user2RandomID",
  },
};

// app.use((req, res, next) => {
const users = {
  "userRandomID": {
    user_id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("a", 10),
  },
 "user2RandomID": {
    user_id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("a", 10),
  },
};

/**
 * Generates a random six-character string
 * @return {string}
 */
function generateRandomString() {
  return (randomstring.generate(6));
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  keys: ['user_id'],
}));

// middleware to make username globally available
app.use((req, res, next) => {
  // set user_id in cookie to a variable
  const user_id = req.session.user_id;
  res.locals.user = users[user_id];

  // set user variable to user object in global users
  // with the user_id provided in cookie
  next();
});

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.redirect('/urls');
  // res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json({ users, urlDatabase });
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });


// add a new route handler for "/urls" and use res.render() to pass the URL data to
// your template.
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});


// We will use the urls_new.ejs template to render the endpoint, /urls/new.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Add a new route in express_server.js which you'll use to render this new template.
app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// We will use the urls_new.ejs template to render the endpoint, /urls/new.
app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let user = res.locals.user;
  let longURL = req.body.longURL;
  // generate randomstring
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    url: longURL,
    user_id: user.user_id,
  };
  // ^^ add req.body.longURL to urlDatabase with key randomstring
  res.redirect(`/urls/${randomURL}`);
});

// // In your Express server, add the following route to handle shortURL requests:
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Add a POST route that removes a URL resource: POST /urls/:id/delete
// (may need Javascript's delete operator to remove the URL)
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  let user = res.locals.user;
  const url = urlDatabase[shortURL];
  // check to make sure current user_id is the same as url id
  if (user.user_id === url.user_id) {
    delete urlDatabase[shortURL];
  }
  // After the resource has been deleted, redirect the client back to the urls_index page ("/urls").
  res.redirect('/urls');
});


app.post('/urls/:shortURL/', (req, res) => {
  let shortURL = req.params.shortURL;
  let updatedLongURL = req.body.updatedLongURL;
  // update this new value in the existing database
  urlDatabase[shortURL].url = updatedLongURL;
  res.redirect(`/urls/${shortURL}`);
});

// Create a GET /login endpoint, which returns a new login page
app.get('/login', (req, res) => {
  res.render("login");
});

// In order to handle the form submission, add an endpoint to handle a POST to /login
app.post('/login', (req, res) => {
  // Use the endpoint to set the cookie parameter called username to the value submitted
  // in the //request body via the form.
  let email = req.body.email;
  let password = req.body.password;
  for (let user in users) {
    // if email is in use then res a 400 error
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
      // console.log('Cookies: ', req.cookies.username)
      // As a reminder, in order to set a cookie, we can use res.cookie, as provided by Express.
      // You don't need to provide the (optional) options for now.
      req.session.user_id = users[user].user_id;
     // After your server has set the cookie it should redirect the browser back to the /urls page.
      res.redirect('/urls');
      return;
      // We still have to display the username back to the user in order to indicate that they have
      // successfully logged in. But we can test that this endpoint is working correctly without that.
    }
  }
  res.status(403).send("user doesn't exist or password is wrong");
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Create a GET /register endpoint, which returns a page that includes a form with an
// email and password field.
// GET method route
app.get('/register', function(req, res) {
  res.render('registration');
});

// Create a POST /register endpoint, and implement it such that it adds a new user object in
// the global users object which keeps track of the newly registered user's email, password and
// user ID.
app.post('/register', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // check to make sure email and password fields are populated
  if (!email || !password) {
    res.status(400).send('Password or email missing.');
  }
  // loop through all users and check if email is already in use
  for (let user in users) {
    // if email is in use then res a 400 error
    if (users[user].email === email) res.status(400).send('Email already in use.');
  }
  let newUser = {
    user_id: generateRandomString(),
    email,
    password: hashedPassword,
  };
  users[newUser.user_id] = newUser;
  req.session.user_id = newUser.user_id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});
