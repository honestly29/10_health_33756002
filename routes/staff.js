const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

// Middleware to ensure only staff can access these pages
function requireStaff(req, res, next) {
    const user = req.session.user;
    if (!user) return res.redirect("/auth/login");

    if (user.role !== "staff") return res.redirect("/auth/login");

    next();
}


// Get staff dashboard
router.get("/dashboard", requireStaff, async (req, res) => {
    try {
        res.render("staff/dashboard", {
            user: req.session.user,
            error: null
        });
    } catch (err) {
        console.log("Dashboard error:", err);
        res.render("staff/dashboard", {
            user: req.session.user,
            error: "An error occurred loading your dashboard."
        });
    }
});


// GET staff appointments
router.get("/appointments", requireStaff, async (req, res) => {
    try {

        // Mark past appointments as 'completed'
        await global.db.query(
            `
            UPDATE appointments
            SET appointment_status = 'completed'
            WHERE appointment_date < NOW()
              AND appointment_status = 'booked'
            `
        );

        const staffUserId = req.session.user.id;

        // Find the staff ID from the logged-in user
        const [staffRows] = await global.db.query(
            "SELECT id FROM staff WHERE user_id = ?",
            [staffUserId]
        );

        if (staffRows.length === 0) {
            return res.render("staff/appointments", {
                user: req.session.user,
                today: [],
                upcoming: [],
                past: [],
                cancelled: [],
                error: "Staff record not found."
            });
        }

        const staffId = staffRows[0].id;

        // Today's appointments 
        const [today] = await global.db.query(
            `
            SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.staff_id = ?
              AND DATE(a.appointment_date) = CURDATE()
              AND a.appointment_status != 'cancelled'
            ORDER BY a.appointment_date ASC
            `,
            [staffId]
        );

        // Upcoming appointments
        const [upcoming] = await global.db.query(
            `
            SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.staff_id = ?
              AND a.appointment_date > NOW()
              AND a.appointment_status != 'cancelled'
            ORDER BY a.appointment_date ASC
            `,
            [staffId]
        );

        // Past appointments 
        const [past] = await global.db.query(
            `
            SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.staff_id = ?
              AND a.appointment_date < CURDATE()
              AND a.appointment_status != 'cancelled'
            ORDER BY a.appointment_date DESC
            `,
            [staffId]
        );

        // Cancelled appointments 
        const [cancelled] = await global.db.query(
            `
            SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.staff_id = ?
              AND a.appointment_status = 'cancelled'
            ORDER BY a.appointment_date DESC
            `,
            [staffId]
        );

        res.render("staff/appointments", {
            user: req.session.user,
            today,
            upcoming,
            past,
            cancelled,
            error: null
        });

    } catch (err) {
        console.log("Error loading staff appointments:", err);

        res.render("staff/appointments", {
            user: req.session.user,
            today: [],
            upcoming: [],
            past: [],
            cancelled: [],
            error: "An error occurred while loading appointments."
        });
    }
});

// POST /staff/appointments/:id/cancel
router.post("/appointments/:id/cancel", 
    requireStaff, 
    [
        param('id')
            .isInt()
            .withMessage('Invalid appointment ID')
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send("Invalid request.");
        }
        
        try {
            const appointmentId = req.params.id;
            const staffUserId = req.session.user.id;

            // Get the staff ID from users table
            const [staffRows] = await global.db.query(
                "SELECT id FROM staff WHERE user_id = ?",
                [staffUserId]
            );

            if (staffRows.length === 0) {
                return res.status(403).send("Staff profile not found.");
            }

            const staffId = staffRows[0].id;

            // Verify appointment exists and belongs to this staff member
            const [apptRows] = await global.db.query(
                "SELECT * FROM appointments WHERE id = ?",
                [appointmentId]
            );

            if (apptRows.length === 0) {
                return res.status(404).send("Appointment not found.");
            }

            const appointment = apptRows[0];

            if (appointment.staff_id !== staffId) {
                return res.status(403).send("You are not allowed to cancel this appointment.");
            }

            // Only allow cancelling future appointments
            if (new Date(appointment.appointment_date) < new Date()) {
                return res
                    .status(400)
                    .send("Past appointments cannot be cancelled.");
            }

            // Update appointment status to cancelled
            await global.db.query(
                "UPDATE appointments SET appointment_status = 'cancelled' WHERE id = ?",
                [appointmentId]
            );

            // Redirect back to appointments page
            res.redirect("/staff/appointments");

        } catch (err) {
            console.error("Error cancelling appointment:", err);
            res.status(500).send("Error cancelling appointment");
        }
});



// GET patient search form
router.get("/patient-search", requireStaff, (req, res) => {
    res.render("staff/patient-search", {
        user: req.session.user,
        error: null,
        results: null
    });
});

// POST patient search form
router.post(
    "/patient-search", 
    requireStaff,
    [
        body('first_name')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('last_name')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('email')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('phone')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('notes')
            .optional({ checkFalsy: true })
            .trim()
            .escape()
    ], 
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("staff/patient-search", {
                user: req.session.user,
                error: errors.array()[0].msg,
                results: null
            });
        }

        const { first_name, last_name, email, phone, notes } = req.body;

        try {
            let query = `
                SELECT *
                FROM patients
                WHERE 1 = 1
            `;
            const params = [];

            if (first_name) {
                query += " AND first_name LIKE ?";
                params.push("%" + first_name + "%");
            }

            if (last_name) {
                query += " AND last_name LIKE ?";
                params.push("%" + last_name + "%");
            }

            if (email) {
                query += " AND email LIKE ?";
                params.push("%" + email + "%");
            }

            if (phone) {
                query += " AND phone LIKE ?";
                params.push("%" + phone + "%");
            }

            if (notes) {
                query += " AND notes LIKE ?";
                params.push("%" + notes + "%");
            }

            query += " ORDER BY last_name, first_name";

            const [results] = await global.db.query(query, params);

            res.render("staff/patient-search", {
                user: req.session.user,
                error: null,
                results
            });

        } catch (err) {
            console.log("Patient search error:", err);

            res.render("staff/patient-search", {
                user: req.session.user,
                error: "An error occurred while searching for patients.",
                results: null
            });
        }
});


router.get(
    "/patients/:id", 
    requireStaff, 
    [
        param('id')
            .isInt()
            .withMessage('Invalid patient ID')
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send("Invalid request.");
        }

        const patientId = req.params.id;

        try {
            const [rows] = await global.db.query(
                "SELECT * FROM patients WHERE id = ?",
                [patientId]
            );

            if (rows.length === 0) {
                return res.status(404).send("Patient not found");
            }

            // Read and clear success message
            const successMessage = req.session.success || null;
            req.session.success = null;

            res.render("staff/patient-details", {
                user: req.session.user,
                patient: rows[0],
                error: null,
                success: successMessage
            });

        } catch (err) {
            console.error(err);
            res.status(500).send("Error loading patient");
        }
});



// POST /staff/patients/:id/notes
router.post(
    "/patients/:id/notes", 
    requireStaff, 
    [
        param('id')
            .isInt()
            .withMessage('Invalid patient ID'),

        body('notes')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Notes cannot exceed 1000 characters')
            .escape()
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send(errors.array()[0].msg);
        }

        const patientId = req.params.id;
        const { notes } = req.body;

        try {
            await global.db.query(
                "UPDATE patients SET notes = ? WHERE id = ?",
                [notes, patientId]
            );

            // Set success message
            req.session.success = "Patient notes updated successfully.";

            res.redirect(`/staff/patients/${patientId}`);

        } catch (err) {
            console.error(err);
            res.status(500).send("Error saving notes");
        }
    }
);




module.exports = router;