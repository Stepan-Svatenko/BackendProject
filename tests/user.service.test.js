jest.mock('../models/User', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByEmail: jest.fn(),
}));

jest.mock('mongoose', () => ({
    isValidObjectId: jest.fn(),
}));

const mongoose = require('mongoose');
const User = require('../models/User');
const userService = require('../service/UserService');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('createUser creates user', async () => {
        User.create.mockResolvedValue({ username: 'alex' });

        const result = await userService.createUser({ username: 'alex' });

        expect(result).toEqual({ username: 'alex' });
        expect(User.create).toHaveBeenCalledWith({ username: 'alex' });
    });

    it('getUsers sorts by createdAt desc', async () => {
        const sort = jest.fn().mockResolvedValue([{ username: 'alex' }]);
        User.find.mockReturnValue({ sort });

        const result = await userService.getUsers();

        expect(User.find).toHaveBeenCalledWith();
        expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual([{ username: 'alex' }]);
    });

    it('getUserByEmail delegates to model method', async () => {
        User.findByEmail.mockResolvedValue({ email: 'alex@example.com' });

        const result = await userService.getUserByEmail('alex@example.com');

        expect(User.findByEmail).toHaveBeenCalledWith('alex@example.com');
        expect(result).toEqual({ email: 'alex@example.com' });
    });

    it('getUserById returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await userService.getUserById('bad');

        expect(result).toBeNull();
        expect(User.findById).not.toHaveBeenCalled();
    });

    it('getUserById finds user for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        User.findById.mockResolvedValue({ _id: '1' });

        const result = await userService.getUserById('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });

    it('updateUser returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await userService.updateUser('bad', { username: 'new' });

        expect(result).toBeNull();
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('updateUser updates user for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        User.findByIdAndUpdate.mockResolvedValue({ _id: '1', username: 'new' });

        const result = await userService.updateUser('507f1f77bcf86cd799439011', { username: 'new' });

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            { username: 'new' },
            { new: true, runValidators: true },
        );
        expect(result).toEqual({ _id: '1', username: 'new' });
    });

    it('removeUser returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await userService.removeUser('bad');

        expect(result).toBeNull();
        expect(User.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('removeUser deletes user for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        User.findByIdAndDelete.mockResolvedValue({ _id: '1' });

        const result = await userService.removeUser('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });
});
