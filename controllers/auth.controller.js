const bcrypt = require('bcryptjs');
const authService = require('../service/AuthService');
const userService = require('../service/UserService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

async function login(req, res) {
    const user = await userService.getUserByEmail(req.body.email);
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }
    if (user.isBlocked) {
        throw new AppError('Account is blocked', 403);
    }

    const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!validPassword) {
        throw new AppError('Invalid credentials', 401);
    }
    const accessToken = await authService.generateAccessToken(user);
    const refreshToken = await authService.generateRefreshToken(user);
    await authService.saveRefreshToken(
        refreshToken,
        user._id,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    return res.json({ accessToken });
}

async function logout(req, res) {
    res.clearCookie('refreshToken');
    return res.send('Logged out');
}

async function refresh(req, res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new AppError('Unauthorized', 401);
    }
    const user = await authService.refreshAccessToken(refreshToken);
    if (!user) {
        throw new AppError('Unauthorized', 401);
    }
    const accessToken = await authService.generateAccessToken(user);
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    return res.json({ accessToken });
}

async function register(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError('Empty body', 400);
    }
    if (!req.body.password) {
        throw new AppError('Password is required', 400);
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await userService.createUser({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash,
        role: 'user',
        isBlocked: false,
    });
    if (!user) {
        throw new AppError('Failed to create user', 400);
    }

    const safeUser = user.toObject ? user.toObject() : user;
    delete safeUser.passwordHash;

    return res.status(201).json(safeUser);
}

module.exports = {
    login: asyncHandler(login),
    logout: asyncHandler(logout),
    refresh: asyncHandler(refresh),
    register: asyncHandler(register),
};
