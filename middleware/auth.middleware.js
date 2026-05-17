const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized');
    }

    const token = header.slice(7);

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = payload;
        req.isAdmin = payload.role === 'admin';
        req.isSelf = payload.sub === req.params.id;

        return next();
    } catch (err) {
        return res.status(401).send('Unauthorized');
    }
}

module.exports = authMiddleware;
