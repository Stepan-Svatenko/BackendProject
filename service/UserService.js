const mongoose = require('mongoose');
const User = require('../models/User');

async function createUser(data) {
    return User.create(data);
}

async function getUsers() {
    return User.find().sort({ createdAt: -1 });
}

async function getUserByEmail(email) {
    return User.findByEmail(email);
}

async function getUserById(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return User.findById(id);
}

async function updateUser(id, data) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function removeUser(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return User.findByIdAndDelete(id);
}

module.exports = {
    createUser,
    getUsers,
    getUserByEmail,
    getUserById,
    updateUser,
    removeUser,
};
