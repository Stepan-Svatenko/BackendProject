const bcrypt = require('bcryptjs');
const userService = require('../service/UserService');

async function listUsers(req, res) {
    const users = await userService.getUsers();
    if (req.isAdmin) return res.json(users);
    return res.json(
        users.map(user => ({
            user_name: user.username,
            user_id: user._id,
            user_mail: user.email
        }))
    );
}

async function hashPassword(password, saltRounds = 10) {
    return bcrypt.hash(password, saltRounds);
}

async function getUser(req, res) {
    const user = await userService.getUserById(req.params.id);

    if (!user) return res.status(404).send('Not found');
    if (req.isAdmin) return res.json(user);
    if (!req.isSelf) return res.status(403).send('Forbidden');

    return res.json({
        user_name: user.username,
        user_id: user._id,
        user_mail: user.email,
        user_role: user.role,
        user_blocked: user.isBlocked,
        user_phone: user.phone
    });
}

async function createUser(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }
        if (!req.isAdmin) {
            return res.status(403).send('Forbidden');
        }

        const payload = { ...req.body };

        if (payload.password && !payload.passwordHash) {
            payload.passwordHash = await hashPassword(payload.password, 10);
            delete payload.password;
        }

        const user = await userService.createUser(payload);
        return res.status(201).json(user);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function updateUser(req, res) {
    try {
        if (!req.isAdmin && !req.isSelf) return res.status(403).send('Forbidden');

        const updateBody = { ...req.body };

        if (!req.isAdmin) {
            delete updateBody.role;
            delete updateBody.isBlocked;
        }
        if (updateBody.password) {
            updateBody.passwordHash = await hashPassword(updateBody.password, 10);
            delete updateBody.password;
        }
        const user = await userService.updateUser(req.params.id, updateBody);
        if (!user) return res.status(404).send('Not found');
        return res.json(user);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function removeUser(req, res) {
    if (!req.isAdmin && !req.isSelf) return res.status(403).send('Forbidden');

    const user = await userService.removeUser(req.params.id);

    if (!user) return res.status(404).send('Not found');

    return res.send('Deleted');
}

module.exports = { listUsers, getUser, createUser, updateUser, removeUser };
