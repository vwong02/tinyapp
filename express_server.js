const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

// Tells Express app to use EJS as it's templating engine
app.set("view engine", "ejs");

// Function to generate a random alphanumeric string that's 6 characters long
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  // Renders the urls_index.ejs and shows the list of URLs with the templateVars
  res.render("urls_index", templateVars);
});

// Route to where users can add a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route to display the specific URL with a specific id and render the urls_show.ejs
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

// Post route to update a URL
app.get("/urls/:id", (req, res) => {
  res.redirect("/urls/:id")
})

//Post to delete the URL 
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls/");
})



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