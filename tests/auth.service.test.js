jest.mock('../models/RefreshToken', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const authService = require('../service/AuthService');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = 'access-secret';
        process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
    });

    it('generateAccessToken signs payload', async () => {
        jwt.sign.mockReturnValue('access-token');

        const result = await authService.generateAccessToken({
            _id: '1',
            email: 'alex@example.com',
            role: 'admin',
        });

        expect(result).toBe('access-token');
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                sub: '1',
                email: 'alex@example.com',
                role: 'admin',
            },
            'access-secret',
            { expiresIn: '15m' },
        );
    });

    it('generateRefreshToken signs payload', async () => {
        jwt.sign.mockReturnValue('refresh-token');

        const result = await authService.generateRefreshToken({
            _id: '1',
            email: 'alex@example.com',
            role: 'admin',
        });

        expect(result).toBe('refresh-token');
        expect(jwt.sign).toHaveBeenCalledWith(
            {
                sub: '1',
                email: 'alex@example.com',
                role: 'admin',
            },
            'refresh-secret',
            { expiresIn: '7d' },
        );
    });

    it('saveRefreshToken stores token', async () => {
        RefreshToken.create.mockResolvedValue({ token: 'rt' });

        const result = await authService.saveRefreshToken('rt', 'user-1', new Date('2026-06-01'));

        expect(RefreshToken.create).toHaveBeenCalledWith({
            token: 'rt',
            user: 'user-1',
            expiresAt: new Date('2026-06-01'),
        });
        expect(result).toEqual({ token: 'rt' });
    });

    it('refreshAccessToken returns user when token is valid and stored', async () => {
        jwt.verify.mockReturnValue({
            sub: 'user-1',
            email: 'alex@example.com',
            role: 'user',
        });
        RefreshToken.findOne.mockResolvedValue({ token: 'rt' });

        const result = await authService.refreshAccessToken('rt');

        expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: 'rt', user: 'user-1' });
        expect(result).toEqual({
            _id: 'user-1',
            email: 'alex@example.com',
            role: 'user',
        });
    });

    it('refreshAccessToken returns null when token not stored', async () => {
        jwt.verify.mockReturnValue({
            sub: 'user-1',
            email: 'alex@example.com',
            role: 'user',
        });
        RefreshToken.findOne.mockResolvedValue(null);

        const result = await authService.refreshAccessToken('rt');

        expect(result).toBeNull();
    });

    it('refreshAccessToken returns null on verify error', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('invalid');
        });

        const result = await authService.refreshAccessToken('rt');

        expect(result).toBeNull();
    });
});
