// routes/patient.js
const express = require('express');
const router = express.Router();
const redirectLogin = require('../middleware/redirectLogin');


// GET /patient/dashboard
router.get('/dashboard', redirectLogin, async (req, res) => {
    try {
        const user = req.session.user;

        res.render('patient/dashboard', {
            user,
            upcomingAppointments: [],
            pastAppointments: [],
        });
    } catch (err) {
        console.error("Error loading patient dashboard:", err);
        res.status(500).send("Error loading dashboard");
    }
});

module.exports = router;