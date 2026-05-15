const mongoose = require('mongoose');
const Event = require('../models/Event');

async function createEvent(data) {
    return Event.create(data);
}

async function getEvents() {
    return Event.find().sort({ eventDate: 1 });
}

async function getEventById(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Event.findById(id);
}

async function updateEvent(id, data) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Event.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function removeEvent(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Event.findByIdAndDelete(id);
}

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    removeEvent,
};
