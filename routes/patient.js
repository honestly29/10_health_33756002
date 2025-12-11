// routes/patient.js
const express = require('express');
const router = express.Router();
const redirectLogin = require('../middleware/redirectLogin');


// GET /patient/dashboard
router.get('/dashboard', redirectLogin, async (req, res) => {
    try {
        const user = req.session.user;
        const userId = user.id;

        // 1. Find patient's ID in the patients table
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userId]
        );

        // If no patient record found, display error
        if (patientRows.length === 0) {
            return res.render('patient/dashboard', {
                user,
                error: "No patient record found.",
                upcomingAppointments: [],
                pastAppointments: []
            });
        }

        const patientId = patientRows[0].id;

        // 2. Fetch upcoming appointments
        const [upcoming] = await global.db.query(
            `SELECT
                a.id, a.appointment_date, a.reason, a.appointment_status,
                s.first_name AS staff_first_name, s.last_name AS staff_last_name, su.username AS staff_username
            FROM appointments a
            JOIN staff s ON a.staff_id = s.id
            JOIN users su ON s.user_id = su.id
            WHERE a.patient_id = ? AND a.appointment_date >= NOW()
            ORDER BY a.appointment_date ASC`,
            [patientId]
        );

        // 3. Fetch past appointments
        const [past] = await global.db.query(
            `SELECT
                a.id, a.appointment_date, a.reason, a.appointment_status,
                s.first_name AS staff_first_name, s.last_name AS staff_last_name, su.username AS staff_username
            FROM appointments a
            JOIN staff s ON a.staff_id = s.id
            JOIN users su ON s.user_id = su.id
            WHERE a.patient_id = ? AND a.appointment_date < NOW()
            ORDER BY a.appointment_date DESC`,
            [patientId]
        );

        // Read and clear success message
        const successMessage = req.session.success || null;
        req.session.success = null;

        // Render dashboard 
        res.render('patient/dashboard', {
            user,
            upcomingAppointments: upcoming,
            pastAppointments: past,
            error: null,
            success: successMessage
        });


    } catch (err) {
        console.error("Error loading patient dashboard:", err);
        res.status(500).send("Error loading dashboard");
    }
});



// GET /patient/book
router.get('/book', redirectLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;

        // 1. Find patient's ID
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userID]
        );

        if (patientRows.length === 0) {
            return res.send("No patient profile found.");
        }

        // 2. Fetch all staff members for selection
        const [staff] = await global.db.query(
            "SELECT id, first_name, last_name, role_title FROM staff"
        );

        res.render("patient/book", {
            user: req.session.user,
            staffList: staff,
            error: null
        });
    } catch (err) {
        console.error("Error loading book appointment page:", err);
        res.status(500).send("Error loading book appointment page");
    }
});


// POST /patient/book
router.post('/book', redirectLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;
        const { staff_id, appointment_date, reason } = req.body;

        // Load staff list again (for repopulating form on error)
        const [staff] = await global.db.query(
            "SELECT id, first_name, last_name, role_title FROM staff"
        );

        // Check required fields
        if (!staff_id || !appointment_date || !reason) {
            return res.render("patient/book", {
                user: req.session.user,
                staffList: staff,
                error: "Please fill in all fields."
            });
        }

        // Server-side prevention for booking dates in the past
        const selectedDate = new Date(appointment_date);
        const now = new Date();

        if (selectedDate < now) {
            return res.render("patient/book", {
                user: req.session.user,
                staffList: staff,
                error: "Cannot book an appointment in the past."
            });
        }

        // Get patient ID
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userID]
        );

        if (patientRows.length === 0) {
            return res.send("No patient profile found.");
        }

        const patientId = patientRows[0].id;

        // Insert new appointment
        await global.db.query(
            `INSERT INTO appointments (patient_id, staff_id, appointment_date, reason)
             VALUES (?, ?, ?, ?)`,
            [patientId, staff_id, appointment_date, reason]
        );

        // Add success message
        req.session.success = "Appointment booked successfully!";
        res.redirect('/patient/dashboard');
    } catch (err) {
        console.error("Error booking appointment:", err);
        res.status(500).send("Error booking appointment");
    }
});

module.exports = router;