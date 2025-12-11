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

        // Render dashboard 
        res.render('patient/dashboard', {
            user,
            upcomingAppointments: upcoming,
            pastAppointments: past,
            error: null
        });

    } catch (err) {
        console.error("Error loading patient dashboard:", err);
        res.status(500).send("Error loading dashboard");
    }
});

module.exports = router;