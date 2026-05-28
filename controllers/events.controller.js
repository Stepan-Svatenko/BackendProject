const eventService = require('../service/EventService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

async function listEvents(req, res) {
    const events = await eventService.getEvents();
    return res.json(events);
}

async function getEvent(req, res) {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).send('Not found');
    return res.json(event);
}

async function createEvent(req, res) {
    if (!req.isAdmin) {
        throw new AppError('Forbidden', 403);
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError('Empty body', 400);
    }
    const event = await eventService.createEvent(req.body);
    return res.status(201).json(event);
}

async function updateEvent(req, res) {
    if (!req.isAdmin) {
        throw new AppError('Forbidden', 403);
    }
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) {
        throw new AppError('Not found', 404);
    }
    return res.json(event);
}

async function removeEvent(req, res) {
    if (!req.isAdmin) {
        throw new AppError('Forbidden', 403);
    }
    const event = await eventService.removeEvent(req.params.id);
    if (!event) {
        throw new AppError('Not found', 404);
    }
    return res.send('Deleted');
}

module.exports = {
    listEvents: asyncHandler(listEvents),
    getEvent: asyncHandler(getEvent),
    createEvent: asyncHandler(createEvent),
    updateEvent: asyncHandler(updateEvent),
    removeEvent: asyncHandler(removeEvent),
};
