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
const jwt = require('jsonwebtoken');
const userService = require('../service/UserService');
const authService = require('../service/AuthService');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

function createRes() {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn(code => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn(body => {
        res.body = body;
        return res;
    });
    res.send = jest.fn(body => {
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
        expect(
            await bcrypt.compare('secret123', userService.createUser.mock.calls[0][0].passwordHash),
        ).toBe(true);
    });

    it('register removes passwordHash from mongoose document response', async () => {
        userService.createUser.mockResolvedValue({
            toObject: () => ({
                _id: '507f1f77bcf86cd799439011',
                email: 'alex@example.com',
                passwordHash: 'should-not-leak',
            }),
        });

        const req = {
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
            },
        };
        const res = createRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json.mock.calls[0][0]).not.toHaveProperty('passwordHash');
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
    it('register rejects empty body', async () => {
        const req = {
            body: {},
        };
        const res = createRes();

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Empty body');
    });
    it('register 400 when create user fails', async () => {
        userService.createUser.mockImplementation(() => {
            throw new Error('Failed to create user');
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

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Failed to create user');
    });

    it('register returns 400 when createUser resolves null', async () => {
        userService.createUser.mockResolvedValue(null);

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

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Failed to create user');
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
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', {
            httpOnly: true,
        });
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

    it('login rejects wrong password', async () => {
        userService.getUserByEmail.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
            role: 'user',
            passwordHash: await bcrypt.hash('secret123', 10),
        });

        const req = {
            body: {
                email: 'alex@example.com',
                password: 'wrong-password',
            },
        };
        const res = createRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Invalid credentials');
    });

    it('login rejects blocked users', async () => {
        userService.getUserByEmail.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
            role: 'user',
            isBlocked: true,
            passwordHash: await bcrypt.hash('secret123', 10),
        });

        const req = {
            body: {
                email: 'alex@example.com',
                password: 'secret123',
            },
        };
        const res = createRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Account is blocked');
    });

    it('login returns 400 when saveRefreshToken fails', async () => {
        userService.getUserByEmail.mockResolvedValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'alex@example.com',
            role: 'user',
            passwordHash: await bcrypt.hash('secret123', 10),
        });
        authService.generateAccessToken.mockResolvedValue('access-token');
        authService.generateRefreshToken.mockResolvedValue('refresh-token');
        authService.saveRefreshToken.mockImplementation(() => {
            throw new Error('saveRefreshToken error');
        });

        const req = {
            body: {
                email: 'alex@example.com',
                password: 'secret123',
            },
        };
        const res = createRes();

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('saveRefreshToken error');
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

    it('refresh rejects when refresh token exists but user lookup returns null', async () => {
        authService.refreshAccessToken.mockResolvedValue(null);

        const req = {
            cookies: {
                refreshToken: 'refresh-token',
            },
        };
        const res = createRes();

        await authController.refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('refresh returns 400 when refreshAccessToken fails', async () => {
        authService.refreshAccessToken.mockImplementation(() => {
            throw new Error('refreshAccessToken error');
        });

        const req = {
            cookies: {
                refreshToken: 'refresh-token',
            },
        };
        const res = createRes();

        await authController.refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('refreshAccessToken error');
    });

    it('refresh rejects missing cookie', async () => {
        const req = { cookies: {} };
        const res = createRes();

        await authController.refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized');
    });

    it('logout clears refresh token cookie', async () => {
        const req = {};
        const res = createRes();

        await authController.logout(req, res);

        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        expect(res.send).toHaveBeenCalledWith('Logged out');
    });
    it('logout returns 400 when clearCookie fails', async () => {
        const req = {};
        const res = createRes();
        res.clearCookie.mockImplementation(() => {
            throw new Error('cookie error');
        });

        await authController.logout(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('cookie error');
    });
});

// describe('Auth middleware', () => {
//     it('rejects request without bearer token', () => {
//         const req = { headers: {} };
//         const res = createRes();
//         const next = jest.fn();

//         authMiddleware(req, res, next);

//         expect(res.status).toHaveBeenCalledWith(401);
//         expect(next).not.toHaveBeenCalled();
//     });
//     it('rejects request with invalid bearer token', () => {
//         const req = {
//             headers: {
//                 authorization: 'Bearer invalid-token',
//             },
//         };
//         const res = createRes();
//         const next = jest.fn();

//         authMiddleware(req, res, next);

//         expect(res.status).toHaveBeenCalledWith(401);
//         expect(next).not.toHaveBeenCalled();
//     });

//     it('accepts valid bearer token and sets req.user flags', () => {
//         const req = {
//             headers: {
//                 authorization: 'Bearer valid-token',
//             },
//             params: {
//                 id: '507f1f77bcf86cd799439011',
//             },
//         };
//         const res = createRes();
//         const next = jest.fn();

//         jest.spyOn(jwt, 'verify').mockReturnValue({
//             sub: '507f1f77bcf86cd799439011',
//             role: 'admin',
//             email: 'alex@example.com',
//         });

//         authMiddleware(req, res, next);

//         expect(req.user).toMatchObject({
//             sub: '507f1f77bcf86cd799439011',
//             role: 'admin',
//             email: 'alex@example.com',
//         });
//         expect(req.isAdmin).toBe(true);
//         expect(req.isSelf).toBe(true);
//         expect(next).toHaveBeenCalled();

//         jwt.verify.mockRestore();
//     });
// });
