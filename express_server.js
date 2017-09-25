const express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

//The body-parser library will allow us to access POST request parameters, such as req.body.longURL,
//which we will store in a variable called urlDatabase
const randomstring = require("randomstring");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var urlDatabase = {
  "b2xVn2": {
    "url": "http://www.lighthouselabs.ca",
    "user_id": "userRandomID"
  },
  "9sm5xK": {
    "url": "http://www.google.com",
    "user_id": "user2RandomID"
  },
}

  // "9sm5xK": "http://www.google.com"

// app.use((req, res, next) => {
const users = {
  "userRandomID": {
    user_id: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
 "user2RandomID": {
    user_id: "user2RandomID",
    email: "user2@example.com",
    password: "a"
  }
}


function generateRandomString() {
  return (randomstring.generate(6))
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// middleware to make username globally available
app.use((req, res, next) => {
  // set user_id in cookie to a variable
  const user_id = req.cookies.user_id;
  res.locals.user = users[user_id];
  // if (!user_id) {
  //   res.locals.user = undefined;
  // } else {
  //   res.locals.user = users[user_id];
  // }
  // set user variable to user object in global users
  // with the user_id provided in cookie
  next();
});

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// add a new route handler for "/urls" and use res.render() to pass the URL data to
//your template.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


// We will use the urls_new.ejs template to render the endpoint, /urls/new.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Add a new route in express_server.js which you'll use to render this new template.
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] } ;
  res.render("urls_show", templateVars);
});

//We will use the urls_new.ejs template to render the endpoint, /urls/new.
app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let user = res.locals.user;
  let longURL = req.body.longURL;
  // generate randomstring
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = {
    url: longURL,
    user_id: user.user_id
  }
  // ^^ add req.body.longURL to urlDatabase with key randomstring
  res.redirect(`/urls/${randomURL}`)
});

// // In your Express server, add the following route to handle shortURL requests:
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Add a POST route that removes a URL resource: POST /urls/:id/delete
//(may need Javascript's delete operator to remove the URL)
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  let user = res.locals.user;
  const url = urlDatabase[shortURL];

  // check to make sure current user_id is the same as url id 
  if (user.user_id === url.user_id) {
    delete urlDatabase[shortURL];
  }

//After the resource has been deleted, redirect the client back to the urls_index page ("/urls").
  res.redirect('/urls')
});


app.post('/urls/:shortURL/', (req, res) => {

  let shortURL = req.params.shortURL;
  let updatedLongURL = req.body.updatedLongURL;
  //update this new value in the existing database
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls')
});

// In order to handle the form submission, add an endpoint to handle a POST to /login
app.post('/login', (req, res) => {
  // Use the endpoint to set the cookie parameter called username to the value submitted
  // in the //request body via the form.
  let email = req.body.email;
  let password = req.body.password;

  for (let user in users) {
    // if email is in use then res a 400 error
    if (users[user].email === email && users[user].password === password) {
      // console.log('Cookies: ', req.cookies.username)
      // As a reminder, in order to set a cookie, we can use res.cookie, as provided by Express.
      // You don't need to provide the (optional) options for now.
      res.cookie('user_id', users[user].user_id);
     // After your server has set the cookie it should redirect the browser back to the /urls page.
      res.redirect('/urls')
      return
      // We still have to display the username back to the user in order to indicate that they have
      // successfully logged in. But we can test that this endpoint is working correctly without that.
    };
  };
  res.status(403).send("user doesn't exist or password is wrong")
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

//Create a GET /register endpoint, which returns a page that includes a form with an
//email and password field.
// GET method route
app.get('/register', function (req, res) {
  res.render('registration')
})

// Create a POST /register endpoint, and implement it such that it adds a new user object in
// the global users object which keeps track of the newly registered user's email, password and
// user ID.
app.post('/register', function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

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
    password
  }

  users[newUser.user_id] = newUser;
  res.cookie('user_id', newUser.user_id);
  res.redirect('/urls')
});

//lecture code
// app.post('/login', (req, res) => {
//   console.log('Post login body', req.body);
//   const foundUser = authenticateUser(req.body.email, req.body.password);
//   if (foundUser !== undefined) {
//     // res.cookie('userId', foundUser.id);
//     req.session.user = foundUser;
//     res.redirect('/');
//   } else {
//     res.status(403);
//     res.render('login', { error: 'Not Found' });
//   }
// });
// console.log(randomstring.generate(7))

 // urlDatabase['cats'] = "meow"
