const eventService = require('../service/EventService');

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
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }
        const event = await eventService.createEvent(req.body);
        return res.status(201).json(event);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function updateEvent(req, res) {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body);
        if (!event) return res.status(404).send('Not found');
        return res.json(event);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function removeEvent(req, res) {
    const event = await eventService.removeEvent(req.params.id);
    if (!event) return res.status(404).send('Not found');
    return res.send('Deleted');
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, removeEvent };
