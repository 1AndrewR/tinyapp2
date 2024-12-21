const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to view URLs.");
  }
  const user = users[userId];
  const userUrls = urlsForUser(userId);
  const templateVars = {
    user,
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = {
    longURL,
    userID: userId,
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to view this URL.");
  }
  const user = users[userId];
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const templateVars = {
    user,
    id: req.params.id,
    longURL: url.longURL,
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to edit URLs.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(403).send("You must be logged in to delete URLs.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("URL not found.");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You do not own this URL.");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send("URL not found.");
  }
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }
  const user = users[userId];
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("Email not found");
  }

  if (user.password !== password) {
    return res.status(403).send("Incorrect password");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }
  const user = users[userId];
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty");
  }

  // Check if email already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already registered");
  }

  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
