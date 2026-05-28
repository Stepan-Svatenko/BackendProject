const AppError = require('../utils/AppError');

function requireAdmin(req, res, next) {
    if (!req.isAdmin) {
        return next(new AppError('Forbidden', 403));
    }

    return next();
}

function requireSelfOrAdmin(req, res, next) {
    if (!req.isAdmin && !req.isSelf) {
        return next(new AppError('Forbidden', 403));
    }

    return next();
}

module.exports = {
    requireAdmin,
    requireSelfOrAdmin,
};
