const userService = require('../service/UserService');

async function listUsers(req, res) {
    const users = await userService.getUsers();
    return res.json(users);
}

async function getUser(req, res) {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).send('Not found');
    return res.json(user);
}

async function createUser(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }
        const user = await userService.createUser(req.body);
        return res.status(201).json(user);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function updateUser(req, res) {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) return res.status(404).send('Not found');
        return res.json(user);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function removeUser(req, res) {
    const user = await userService.removeUser(req.params.id);
    if (!user) return res.status(404).send('Not found');
    return res.send('Deleted');
}

module.exports = { listUsers, getUser, createUser, updateUser, removeUser };
