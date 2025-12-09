const express = require ('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
require('dotenv').config();

// Create the express application object
const app = express()
const port = 8000

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
}));


// View engine
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Make the user object available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});


// Load the route handlers
app.use("/", require("./routes/main"));

//app.use("/", require("./routes/auth"));

//app.use("/patient", require("./routes/patient"));

//app.use("/staff", require("./routes/staff"));

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Start the web app listening
app.listen(port, () => console.log(`App running on port ${port}!`));


