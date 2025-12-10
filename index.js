const express = require ('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
require('dotenv').config();
const mysql = require('mysql2');

// Create the express application object
const app = express()
const port = 8000


// Define the database connection pool
const db = mysql.createPool({
    host: process.env.HEALTH_HOST,
    user: process.env.HEALTH_USER,
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;


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
app.use("/", require("./routes/auth"));
//app.use("/patient", require("./routes/patient"));
//app.use("/staff", require("./routes/staff"));


// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});


// Start the web app 
app.listen(port, () => console.log(`App running on port ${port}!`));


