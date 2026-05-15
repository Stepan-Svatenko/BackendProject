const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

async function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
}

async function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
}

async function saveRefreshToken(token, userId, expiresAt) {
    return RefreshToken.create({ token, user: userId, expiresAt });
}

async function refreshAccessToken(token) {
    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const stored = await RefreshToken.findOne({ token, user: payload.sub });
        if (!stored) return null;

        return {
            _id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    saveRefreshToken,
    refreshAccessToken,
};
