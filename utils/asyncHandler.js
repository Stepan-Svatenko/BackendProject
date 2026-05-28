function asyncHandler(fn) {
    return function asyncMiddleware(req, res, next) {
        return Promise.resolve(fn(req, res, next)).catch(err => {
            if (typeof next === 'function') {
                return next(err);
            }

            if (res && typeof res.status === 'function' && typeof res.send === 'function') {
                const status = err.status || err.statusCode || 400;
                return res.status(status).send(err.message || 'Internal Server Error');
            }

            throw err;
        });
    };
}

module.exports = asyncHandler;
