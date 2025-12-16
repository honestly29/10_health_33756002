const express = require ('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const mysql = require('mysql2/promise');

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
    secret: process.env.SESSION_SECRET || 'dev_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
}));


// View engine
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// UK DateTime helper for all views
app.locals.formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Base path for all views
app.locals.BASE_PATH = process.env.BASE_PATH || "";

// Make the user object available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Make the session object available in all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});



// Load the route handlers
const mainRouter = require('./routes/main');
app.use("/", mainRouter);

const authRouter = require('./routes/auth');
app.use("/auth", authRouter);

const patientRouter = require('./routes/patient');
app.use("/patient", patientRouter);

const staffRouter = require('./routes/staff');
app.use("/staff", staffRouter);


// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});


// Start the web app 
app.listen(port, () => console.log(`App running on port ${port}!`));


