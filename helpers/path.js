const base = process.env.BASE_PATH || "";

function withBase(path) {
    return base + path;
}

module.exports = { withBase };
