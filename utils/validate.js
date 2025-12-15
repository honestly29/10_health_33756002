// utils/validate.js
const { validationResult } = require('express-validator');

function validate(req, res, view, extraData = {}) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render(view, {
            error: errors.array()[0].msg,
            ...extraData
        });
    }

    return null;
};

module.exports = validate;