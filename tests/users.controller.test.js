jest.mock('../service/UserService', () => ({
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    removeUser: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const userService = require('../service/UserService');
const usersController = require('../controllers/users.controller');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Users controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('listUsers returns users', async () => {
        userService.getUsers.mockResolvedValue([{ username: 'alex' }]);

        const req = { isAdmin: true };
        const res = createRes();

        await usersController.listUsers(req, res);

        expect(res.json).toHaveBeenCalledWith([{ username: 'alex' }]);
    });

    it('listUsers maps users for non-admin', async () => {
        userService.getUsers.mockResolvedValue([
            { username: 'alex', _id: '1', email: 'alex@example.com' },
        ]);

        const req = { isAdmin: false };
        const res = createRes();

        await usersController.listUsers(req, res);

        expect(res.json).toHaveBeenCalledWith([
            {
                user_name: 'alex',
                user_id: '1',
                user_mail: 'alex@example.com',
            },
        ]);
    });

    it('getUser returns 404 when missing', async () => {
        userService.getUserById.mockResolvedValue(null);

        const req = { params: { id: '1' } };
        const res = createRes();

        await usersController.getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('getUser returns user when found', async () => {
        userService.getUserById.mockResolvedValue({ _id: '1', username: 'alex' });

        const req = { params: { id: '1' }, isAdmin: true };
        const res = createRes();

        await usersController.getUser(req, res);

        expect(res.json).toHaveBeenCalledWith({ _id: '1', username: 'alex' });
    });

    it('getUser returns forbidden for non owner non admin', async () => {
        userService.getUserById.mockResolvedValue({
            _id: '1',
            username: 'alex',
            email: 'alex@example.com',
            role: 'user',
            isBlocked: false,
            phone: '+380501112233',
        });

        const req = { params: { id: '1' }, isAdmin: false, isSelf: false };
        const res = createRes();

        await usersController.getUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('getUser returns limited profile for self', async () => {
        userService.getUserById.mockResolvedValue({
            _id: '1',
            username: 'alex',
            email: 'alex@example.com',
            role: 'user',
            isBlocked: false,
            phone: '+380501112233',
        });

        const req = { params: { id: '1' }, isAdmin: false, isSelf: true };
        const res = createRes();

        await usersController.getUser(req, res);

        expect(res.json).toHaveBeenCalledWith({
            user_name: 'alex',
            user_id: '1',
            user_mail: 'alex@example.com',
            user_role: 'user',
            user_blocked: false,
            user_phone: '+380501112233',
        });
    });

    it('createUser hashes plain password', async () => {
        userService.createUser.mockResolvedValue({ username: 'alex' });

        const req = {
            isAdmin: true,
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
            },
        };
        const res = createRes();

        await usersController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(userService.createUser.mock.calls[0][0].passwordHash).toBeDefined();
        expect(await bcrypt.compare('secret123', userService.createUser.mock.calls[0][0].passwordHash)).toBe(true);
    });

    it('createUser returns created user', async () => {
        userService.createUser.mockResolvedValue({ _id: '1', username: 'alex' });

        const req = {
            isAdmin: true,
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
            },
        };
        const res = createRes();

        await usersController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ _id: '1', username: 'alex' });
    });

    it('createUser returns 400 for empty body', async () => {
        const req = { body: {} };
        const res = createRes();

        await usersController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Empty body');
    });

    it('createUser returns forbidden for non admin', async () => {
        const req = {
            isAdmin: false,
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
            },
        };
        const res = createRes();

        await usersController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('createUser returns 400 when service throws', async () => {
        userService.createUser.mockImplementation(() => {
            throw new Error('create error');
        });

        const req = {
            isAdmin: true,
            body: {
                username: 'alex',
                email: 'alex@example.com',
                phone: '+380501112233',
                password: 'secret123',
            },
        };
        const res = createRes();

        await usersController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('create error');
    });

    it('updateUser returns forbidden for non owner non admin', async () => {
        const req = {
            params: { id: '1' },
            body: { username: 'new' },
            isAdmin: false,
            isSelf: false,
        };
        const res = createRes();

        await usersController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('updateUser returns updated user for owner', async () => {
        userService.updateUser.mockResolvedValue({ _id: '1', username: 'alex2' });

        const req = {
            params: { id: '1' },
            body: { password: 'newpass' },
            isAdmin: false,
            isSelf: true,
        };
        const res = createRes();

        await usersController.updateUser(req, res);

        expect(res.json).toHaveBeenCalledWith({ _id: '1', username: 'alex2' });
        expect(userService.updateUser.mock.calls[0][1].passwordHash).toBeDefined();
        expect(userService.updateUser.mock.calls[0][1].password).toBeUndefined();
    });

    it('updateUser lets admin change role and isBlocked', async () => {
        userService.updateUser.mockResolvedValue({ _id: '1', role: 'admin', isBlocked: true });

        const req = {
            params: { id: '1' },
            body: { role: 'admin', isBlocked: true },
            isAdmin: true,
            isSelf: false,
        };
        const res = createRes();

        await usersController.updateUser(req, res);

        expect(res.json).toHaveBeenCalledWith({ _id: '1', role: 'admin', isBlocked: true });
        expect(userService.updateUser.mock.calls[0][1].role).toBe('admin');
        expect(userService.updateUser.mock.calls[0][1].isBlocked).toBe(true);
    });

    it('updateUser returns 404 when service returns null', async () => {
        userService.updateUser.mockResolvedValue(null);

        const req = {
            params: { id: '1' },
            body: { username: 'new' },
            isAdmin: true,
            isSelf: false,
        };
        const res = createRes();

        await usersController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('updateUser returns 400 when service throws', async () => {
        userService.updateUser.mockImplementation(() => {
            throw new Error('update error');
        });

        const req = {
            params: { id: '1' },
            body: { username: 'new' },
            isAdmin: true,
            isSelf: false,
        };
        const res = createRes();

        await usersController.updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('update error');
    });

    it('removeUser returns Deleted for allowed user', async () => {
        userService.removeUser.mockResolvedValue({ _id: '1' });

        const req = {
            params: { id: '1' },
            isAdmin: true,
            isSelf: false,
        };
        const res = createRes();

        await usersController.removeUser(req, res);

        expect(res.send).toHaveBeenCalledWith('Deleted');
    });

    it('removeUser returns forbidden for non owner non admin', async () => {
        const req = {
            params: { id: '1' },
            isAdmin: false,
            isSelf: false,
        };
        const res = createRes();

        await usersController.removeUser(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('removeUser returns 404 when user is missing', async () => {
        userService.removeUser.mockResolvedValue(null);

        const req = {
            params: { id: '1' },
            isAdmin: true,
            isSelf: false,
        };
        const res = createRes();

        await usersController.removeUser(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });
});
