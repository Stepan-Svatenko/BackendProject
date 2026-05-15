jest.mock('../service/UserService', () => ({
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
}));

jest.mock('../service/AuthService', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    saveRefreshToken: jest.fn(),
    refreshAccessToken: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const userService = require('../service/UserService');
const authService = require('../service/AuthService');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

function createRes() {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn((body) => {
        res.body = body;
        return res;
    });
    res.send = jest.fn((body) => {
        res.text = body;
        return res;
    });
    res.cookie = jest.fn(() => res);
    res.clearCookie = jest.fn(() => res);
    return res;
}

describe('Auth controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('register hashes password before createUser', async () => {
        userService.createUser.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
        });

        const req = {
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
                role: 'user',
            },
        };
        const res = createRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(userService.createUser).toHaveBeenCalledTimes(1);
        expect(userService.createUser.mock.calls[0][0]).toMatchObject({
            username: 'alex',
            email: 'alex@example.com',
            phone: '+380501112233',
            role: 'user',
            isBlocked: false,
        });
        expect(userService.createUser.mock.calls[0][0].passwordHash).toBeDefined();
        expect(await bcrypt.compare('secret123', userService.createUser.mock.calls[0][0].passwordHash)).toBe(true);
    });

    it('register rejects missing password', async () => {
        const req = {
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
            },
        };
        const res = createRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Password is required');
    });

    it('login returns tokens for valid credentials', async () => {
        userService.getUserByEmail.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
            role: 'user',
            passwordHash: await bcrypt.hash('secret123', 10),
        });
        authService.generateAccessToken.mockResolvedValue('access-token');
        authService.generateRefreshToken.mockResolvedValue('refresh-token');
        authService.saveRefreshToken.mockResolvedValue(true);

        const req = {
            body: {
                email: 'alex@example.com',
                password: 'secret123',
            },
        };
        const res = createRes();

        await authController.login(req, res);

        expect(res.json).toHaveBeenCalledWith({ accessToken: 'access-token' });
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', { httpOnly: true });
        expect(authService.saveRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('login rejects invalid credentials', async () => {
        userService.getUserByEmail.mockResolvedValue(null);

        const req = {
            body: {
                email: 'alex@example.com',
                password: 'wrong',
            },
        };
        const res = createRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Invalid credentials');
    });

    it('refresh returns new access token when refresh token is valid', async () => {
        authService.refreshAccessToken.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
            role: 'user',
        });
        authService.generateAccessToken.mockResolvedValue('new-access-token');

        const req = {
            cookies: {
                refreshToken: 'refresh-token',
            },
        };
        const res = createRes();

        await authController.refresh(req, res);

        expect(res.json).toHaveBeenCalledWith({ accessToken: 'new-access-token' });
    });

    it('logout clears refresh token cookie', async () => {
        const req = {};
        const res = createRes();

        await authController.logout(req, res);

        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        expect(res.send).toHaveBeenCalledWith('Logged out');
    });
});

describe('Auth middleware', () => {
    it('rejects request without bearer token', () => {
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
