const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Auth middleware', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('rejects request without bearer token', () => {
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('accepts valid bearer token and sets flags', () => {
        jest.spyOn(jwt, 'verify').mockReturnValue({
            sub: '507f1f77bcf86cd799439011',
            role: 'admin',
            email: 'alex@example.com',
        });

        const req = {
            headers: { authorization: 'Bearer valid-token' },
            params: { id: '507f1f77bcf86cd799439011' },
        };
        const res = createRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(req.isAdmin).toBe(true);
        expect(req.isSelf).toBe(true);
        expect(next).toHaveBeenCalled();
    });

    it('rejects invalid bearer token', () => {
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('invalid token');
        });

        const req = {
            headers: { authorization: 'Bearer invalid-token' },
            params: { id: '507f1f77bcf86cd799439011' },
        };
        const res = createRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
