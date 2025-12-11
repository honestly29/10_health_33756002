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
        // 1. Check if username already exists
        const [rows] = await global.db.query('SELECT id FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            return res.render('register', { error: 'Username already taken' });
        }

        // 2. Hash password
        const hashed_password = await bcrypt.hash(password, 10);
        
        // 3. Insert new user into USERS table
        const [result] = await global.db.query(
            "INSERT INTO users (username, hashed_password, user_role) VALUES (?, ?, 'patient')",
            [username, hashed_password]
        );

        const userId = result.insertId;

        // 4. Insert user details into PATIENTS table
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


// GET login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// POST login page
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Look up user by username
        const [rows] = await global.db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        const user = rows[0];

        // 2. Compare passwords
        const match = await bcrypt.compare(password, user.hashed_password);

        if (!match) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // 3. Set logged-in user's session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.user_role
        };

        // 4. Redirect to correct dashboard
        if (user.user_role === "staff") {
            return res.redirect('/staff/dashboard');
        }

        return res.redirect('/patient/dashboard');
        
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Something went wrong' });
    }
});

// GET logout
router.get('/logout', (req, res) => {
    // Destroy the session to log user out
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect('/');  
        }
        res.redirect('/');
    });
});

module.exports = router;
