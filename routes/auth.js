const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();


// GET register page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST register page
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, username, password } = req.body;

    try {
        // Check if username already exists
        const [rows] = await global.db.query('SELECT id FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            return res.render('register', { error: 'Username already taken' });
        }

        // Hash password
        const hashed_password = await bcrypt.hash(password, 10);
        
        // 1. Insert new user into USERS table
        const [result] = await global.db.query(
            "INSERT INTO users (username, hashed_password, user_role) VALUES (?, ?, 'patient')",
            [username, hashed_password]
        );

        const userId = result.insertId;

        // 2. Insert user details into PATIENTS table
        await global.db.query(
            "INSERT INTO patients (user_id, first_name, last_name, email) VALUES (?, ?, ?, ?)",
            [userId, first_name, last_name, email]
        );

        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Something went wrong' });
    }
});




module.exports = router;
