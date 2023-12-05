const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080
const { getUserIDByEmail, generateRandomString } = require('./helpers');

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["cheese", "chicken", "capybara"]
}));

// Tells Express app to use EJS as it's templating engine
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "1@2.com",
    password: "pw1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "2@3.com",
    password: "pw2",
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${ PORT }!`);
});

// Adds route for the JSON response with the urlDatabase data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Routes to default page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
});

// Route to show all the shortened URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, email: req.session.user_email, userID: req.session.user_id, users };

  if (!req.session.user_id) {
    // res.send('login', "Please log in to view your URLs.")
    res.redirect("/login");

  }

  res.render("urls_index", templateVars);
});

// Route to where users can add a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { userID: req.session.user_id, email: req.session.user_email, users };
  if (!templateVars.userID) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// Route to display the specific URL with a specific id and render the urls_show.ejs
app.get("/urls/:id", (req, res) => {

  const id = req.params.id;

  //If invalid short URL sends message that it does not exist
  if (!urlDatabase[id]) {
    return res.send("No URL exists for this short URL ID");
  }

  // If user isn't logged in, please log in
  if (!req.session.user_id) {
    return res.send("Please log in");
  }

  if (req.session.user_id !== urlDatabase[id].userID) {
    return res.status(400).send("You don't have permssion to view this URL");
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, userID: req.session.user_id, email: req.session.user_email, users };

  return res.render("urls_show", templateVars);
});

// Generates a random id, posts the new id and longURL on /urls and redirects to the specific urls page with the new id
app.post("/urls", (req, res) => {
  let randomID = generateRandomString();

  //Must be logged in to see shorten URLs
  if (!req.session.user_id) {
    res.send("Please log in to shorten URLs");
  }

  // The user can only see their own urls
  urlDatabase[randomID] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log("*** Line 107: urlDatabase ***", urlDatabase);
  res.redirect(`/urls/${ randomID }`);
});

//Post to delete the URL 
app.post("/urls/:id/delete", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email: req.session.user_email, userID: req.session.user_id, users };


  //If URL doesn't exist, send error message
  if (!templateVars.id) {
    return res.send("This URL does not exist");
  }

  // If user isn't logged in, print log in error
  if (!templateVars.userID) {
    return res.send("Please log in");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

// Redirects to the longURL page
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

// Update the URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_ID = req.session.user_id;

  if (user_ID !== urlDatabase[id].userID) {
    return res.send("You don't have permission to edit this URL");
  }

  urlDatabase[id].longUrl = req.body.longURL;

  res.redirect("/urls");
});

// Route to logout and clear cooxies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Route for registration page
app.get("/register", (req, res) => {
  const templateVars = { userID: req.session.user_id, email: req.session.user_email, users };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("urls_registration", templateVars);
});

// Route to send post request for submit button on registration page
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString();
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(req.body.password);

  const newUser = {
    id: randomUserID,
    email,
    password: hashedPassword
  };

  if (!email || !password) {
    return res.status(400).send("Error: email and password is required");
  }


  if (getUserIDByEmail(email, users)) {
    return res.status(404).send("User already exists");
  }

  users[newUser.id] = newUser;
  req.session.user_id = randomUserID;
  req.session.user_email = email;
  console.log("*** Line187: users ***", users);
  res.redirect("/urls");
});


// Route to redirect to login page
app.get("/login", (req, res) => {
  const templateVars = { userID: req.session.user_id, email: req.session.user_email, users };
  if (templateVars.userID) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});


// // Route to log in and save username as a cookie
app.post("/login", (req, res) => {

  const { email, password } = req.body;
  const userInfo = getUserIDByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Error: email and password is required");
  }

  for (user in users) {
    if (!userInfo) {
      return res.status(403).send("No account associated with that email was found.");
    }

    if (userInfo) {
      if (!bcrypt.compareSync(password, users[userInfo].password)) {
        return res.status(403).send("Password is incorrect.");
      }
    }
  }

  // res.cookie("user_id", userInfo.id);
  // res.cookie("user_email", email);
  req.session.user_id = users[userInfo].id;
  req.session.user_email = email;

  res.redirect("/urls");
});

