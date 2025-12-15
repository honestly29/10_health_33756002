const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { body, validationResult } = require('express-validator');


// GET register page
router.get('/register', (req, res) => {
    res.render('register', { 
        error: null,
        formData: {} 
    });
});

// POST register page
router.post(
    '/register', 
    [
        body('first_name')
            .trim()
            .notEmpty()
            .withMessage('First name is required')
            .escape(),

        body('last_name')
            .trim()
            .notEmpty()
            .withMessage('Last name is required')
            .escape(),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Invalid email address')
            .normalizeEmail(),

        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .isMobilePhone('any')
            .withMessage('Invalid phone number'),

        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long')
            .isAlphanumeric()
            .withMessage('Username must contain only letters and numbers')
            .escape(),

        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0
            })
            .withMessage('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number')
        
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('register', {
                error: errors.array()[0].msg,
                formData: req.body
            });
        }

        const { first_name, last_name, email, phone, username, password } = req.body;

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
                "INSERT INTO patients (user_id, first_name, last_name, email, phone) VALUES (?, ?, ?, ?, ?)",
                [userId, first_name, last_name, email, phone]
            );

            req.session.success = 'Registration successful. Please log in.';
            res.redirect('/auth/login');

        } catch (err) {
            console.error(err);
            res.render('register', { error: 'Something went wrong' });
        }
});


// GET login page
router.get('/login', (req, res) => {
    const success = req.session.success;
    delete req.session.success;

    res.render('login', { 
        error: null, 
        success: success || null
    });
});

// POST login page
router.post('/login', 
    [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .escape(),

        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    async (req, res) => {

        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.render('login', {
                error: errors.array()[0].msg,
                success: null
            });
        }

        const { username, password } = req.body;

        try {
            // 1. Look up user by username
            const [rows] = await global.db.query(
                'SELECT * FROM users WHERE username = ?', 
                [username]
            );
            
            if (rows.length === 0) {
                return res.render('login', { 
                    error: 'Invalid username or password',
                    success: null
                });
            }

            const user = rows[0];

            // 2. Compare passwords
            const match = await bcrypt.compare(password, user.hashed_password);

            if (!match) {
                return res.render('login', { 
                    error: 'Invalid username or password',
                    success: null
                });
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
            res.render('login', { 
                error: 'Something went wrong',
                success: null
            });
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
