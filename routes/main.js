// Create a new router
const express = require("express");
const router = express.Router();

// Handle the main routes
router.get("/", (req, res) => {
    res.render("home.ejs", { title: "Home" });
}); 

router.get("/about", (req, res) => {
    res.render("about.ejs", { title: "About" });
});

// Export the router object so index.js can access it
module.exports = router;

