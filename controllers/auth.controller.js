const authService = require('../service/AuthService');
const userService = require('../service/UserService');
const bcrypt = require('bcryptjs');

async function login(req, res) {
    try {
        const user = await userService.getUserByEmail(req.body.email);
        if (!user) return res.status(401).send('Invalid credentials');
        const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
        if (!validPassword) return res.status(401).send('Invalid credentials');
        const accessToken = await authService.generateAccessToken(user);
        const refreshToken = await authService.generateRefreshToken(user);
        await authService.saveRefreshToken(
            refreshToken,
            user._id,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.json({ accessToken });
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('refreshToken');
        return res.send('Logged out');
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function refresh(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).send('Unauthorized');
        const user = await authService.refreshAccessToken(refreshToken);
        if (!user) return res.status(401).send('Unauthorized');
        const accessToken = await authService.generateAccessToken(user);
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.json({ accessToken });
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function register(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }
        if (!req.body.password) {
            return res.status(400).send('Password is required');
        }

        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const user = await userService.createUser({
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            passwordHash,
            role: req.body.role,
            isBlocked: req.body.isBlocked ?? false,
        });
        if (!user) return res.status(400).send('Failed to create user');
        return res.status(201).json(user);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

module.exports = { login, logout, refresh, register };
