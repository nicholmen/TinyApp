var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

//The body-parser library will allow us to access POST request parameters, such as req.body.longURL,
//which we will store in a variable called urlDatabase
const randomstring = require("randomstring");
const bodyParser = require("body-parser");

function generateRandomString() {
  return (randomstring.generate(6))
}

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


// add a new route handler for "/urls" and use res.render() to pass the URL data to your template.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(templateVars)
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
  console.log(req.body);  // debug statement to see POST parameters
  // generate randomstring
  let longURL = req.body.longURL;
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = longURL;
  // ^^ add req.body.longURL to urlDatabase with key randomstring


  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
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
  delete urlDatabase[shortURL];
//After the resource has been deleted, redirect the client back to the urls_index page ("/urls").
  res.redirect('/urls')
});


app.post('/urls/:shortURL/', (req, res) => {

  let shortURL = req.params.shortURL;
  let updatedLongURL = req.body.updatedLongURL;
  //console.log(updatedLongURL);
  //update this new value in the existing database
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect('/urls')
});

// console.log(randomstring.generate(7))

 // urlDatabase['cats'] = "meow"

