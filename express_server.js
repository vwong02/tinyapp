const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Tells Express app to use EJS as it's templating engine
app.set("view engine", "ejs");

// Function to generate a random alphanumeric string that's 6 characters long
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

//Function to find users by email
const getUserIDByEmail = (email) => {
  for (let ID in users) {
    if (users[ID].email === email) {
      return users[ID];
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// Adds route for the JSON responst with the urlDatabase data
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to show all the shortened URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userID: req.cookies["user_id"], users };
  // Renders the urls_index.ejs and shows the list of URLs with the templateVars
  console.log(users[req.cookies["user_id"]])
  res.render("urls_index", templateVars);
});

// Route to where users can add a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { userID: req.cookies["user_id"] }
  res.render("urls_new", templateVars);
});

// Route to display the specific URL with a specific id and render the urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["user_id"], users};
  res.render("urls_show", templateVars);
});

// Generates a random id, posts the new id and longURL on /urls and redirects to the specific urls page with the new id
app.post("/urls", (req, res) => {
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${ id }`);
});

// Redirects to the longURL page
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

//Post to delete the URL 
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls/");
})

// Update the URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls/")
})

// Route to logout and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

// Route for registration page
app.  get("/register", (req, res) => {
  const templateVars = { userID: req.cookies["user_id"], users}
  res.render("urls_registration", templateVars)
})

// Route to send post request for submit button on registration page
app.post("/register", (req, res) => {
  const randomUserID = generateRandomString()
  const { email, password } = req.body

  const newUser = {
    id: randomUserID,
    email,
    password
  }

  if (!email || !password) {
    res.status(400).send("Error: email and password is required")
  }

  //have to use a for in loop to iterate through objects***
  for (user in users) {
    if(getUserIDByEmail(email)) {
      res.status(404).send("User already exists")
    }
  }

  users[newUser.id] = newUser
  res.cookie("user_id", randomUserID)
  res.cookie("user_email", email)
  console.log(users)
  res.redirect("/urls")
})

// // Route to redirect to login page
// app.get("/login", (req, res) => {
//   const templateVars = { username: req.cookies["user_id"]}
//   res.render("urls_login", templateVars)
// })


// // Route to log in and save username as a cookie
// app.post("/login", (req, res) => {
//   const { email, password } = req.body
//   const username = req.cookies["user_id"]
  
//   if (!email || !password) {
//     res.status(400).send("Error: email and password is required")
//   }

//   for (user in users) {
//     if(!getUserIDByEmail(email)) {
//       res.status(404).send("No account associated with that email was found.")
//     }
//   }

//   const userID = getUserIDByEmail(email)
//   console.log(userID)
//   res.cookie("user_id", userID.id)
//   res.redirect("/urls")
// })

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${ a }`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${ a }`);
// });