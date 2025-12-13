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
                success: null,
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


// POST /patient/appointments/:id/cancel
router.post('/appointments/:id/cancel', redirectLogin, async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const userID = req.session.user.id;

        // 1. Get patient ID
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userID]
        );

        if (patientRows.length === 0) {
            return res.status(403).send("No patient profile found.");
        }

        const patientId = patientRows[0].id;

        // 2. Verify appointment belongs to patient
        const [apptRows] = await global.db.query(
            'SELECT * FROM appointments WHERE id = ?',
            [appointmentId]
        );

        if (apptRows.length === 0) {
            return res.status(404).send("Appointment not found.");
        }

        if (apptRows[0].patient_id !== patientId) {
            return res.status(403).send("You are not allowed to cancel this appointment.");
        }

        // 3. Cancel the appointment
        await global.db.query(
            "UPDATE appointments SET appointment_status = 'cancelled' WHERE id = ?",
            [appointmentId]
        );

        // Success message
        req.session.success = "Appointment cancelled successfully.";
        res.redirect('/patient/dashboard');
    } catch (err) {
        console.error("Error cancelling appointment:", err);
        res.status(500).send("Error cancelling appointment");
    }
});


// GET /patient/search
router.get('/search', redirectLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;

        // Get patient ID
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userID]
        );

        if (patientRows.length === 0) {
            return res.send("No patient profile found.");
        }

        // Load staff
        const [staff] = await global.db.query(
            "SELECT id, first_name, last_name, role_title FROM staff"
        );

        res.render("patient/search", {
            user: req.session.user,
            staffList: staff,
            results: null,
            error: null
        });
    } catch (err) {
        console.error("Error loading search page:", err);
        res.status(500).send("Error loading search page");
    }
});


// POST /patient/search
router.post('/search', redirectLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;
        const { date_from, date_to, staff_id, status, keyword } = req.body;

        // Reload staff list
        const [staffList] = await global.db.query(
            "SELECT id, first_name, last_name, role_title FROM staff"
        );

        // Get patient ID
        const [patientRows] = await global.db.query(
            'SELECT id FROM patients WHERE user_id = ?',
            [userID]
        );

        if (patientRows.length === 0) {
            return res.send("No patient profile found.");
        }
        
        const patientId = patientRows[0].id;

        // Base SQL query
        let sql = `
            SELECT a.*,
                s.first_name AS staff_first_name, 
                s.last_name AS staff_last_name,
                su.username AS staff_username
            FROM appointments a
            JOIN staff s ON a.staff_id = s.id
            JOIN users su ON s.user_id = su.id
            WHERE a.patient_id = ?`;

        const params = [patientId];

        // Apply filters
        if (date_from) {
            sql += " AND a.appointment_date >= ?";
            params.push(date_from);
        }

        if (date_to) {
            sql += " AND a.appointment_date <= ?";
            params.push(date_to);
        }

        if (staff_id) {
            sql += " AND a.staff_id = ?";
            params.push(staff_id);
        }

        if (status) {
            sql += " AND a.appointment_status = ?";
            params.push(status);
        }

        if (keyword) {
            sql += " AND a.reason LIKE ?";
            params.push(`%${keyword}%`);
        }

        sql += " ORDER BY a.appointment_date ASC";

        // Execute query
        const [results] = await global.db.query(sql, params);

        // Render results
        res.render("patient/search", {
            user: req.session.user,
            staffList,
            results,
            error: results.length === 0 ? "No appointments found." : null
        });
    } catch (err) {
        console.error("Error performing search:", err);
        res.status(500).send("Error performing search");
    }
});

module.exports = router;