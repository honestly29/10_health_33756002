// middleware/redirectLogin.js

function redirectLogin(req, res, next) {
    // If there is no logged in user stored in the session, redirect to login
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }
    // Otherwise allow request to continue
    next(); 
};


module.exports = redirectLogin;