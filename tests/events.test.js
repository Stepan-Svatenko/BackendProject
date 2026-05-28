jest.mock('../service/EventService', () => ({
    getEvents: jest.fn(),
    getEventById: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    removeEvent: jest.fn(),
}));

const eventService = require('../service/EventService');
const eventsController = require('../controllers/events.controller');

function createRes() {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
}

describe('Events controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('listEvents returns events', async () => {
        eventService.getEvents.mockResolvedValue([{ title: 'Rock Concert' }]);

        const req = {};
        const res = createRes();

        await eventsController.listEvents(req, res);

        expect(res.json).toHaveBeenCalledWith([{ title: 'Rock Concert' }]);
    });

    it('getEvent returns event when found', async () => {
        eventService.getEventById.mockResolvedValue({ _id: '1', title: 'Rock Concert' });

        const req = { params: { id: '1' } };
        const res = createRes();

        await eventsController.getEvent(req, res);

        expect(res.json).toHaveBeenCalledWith({ _id: '1', title: 'Rock Concert' });
    });

    it('getEvent returns 404 when event is missing', async () => {
        eventService.getEventById.mockResolvedValue(null);

        const req = { params: { id: '1' } };
        const res = createRes();

        await eventsController.getEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('createEvent returns 400 for empty body', async () => {
        const req = { body: {}, isAdmin: true };
        const res = createRes();

        await eventsController.createEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Empty body');
    });

    it('createEvent returns forbidden for non admin', async () => {
        const req = { body: { title: 'Rock Concert' }, isAdmin: false };
        const res = createRes();

        await eventsController.createEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('createEvent returns created event', async () => {
        eventService.createEvent.mockResolvedValue({ _id: '1', title: 'Rock Concert' });

        const req = { body: { title: 'Rock Concert' }, isAdmin: true };
        const res = createRes();

        await eventsController.createEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ _id: '1', title: 'Rock Concert' });
    });

    it('createEvent returns 400 when service throws', async () => {
        eventService.createEvent.mockImplementation(() => {
            throw new Error('create error');
        });

        const req = { body: { title: 'Test' }, isAdmin: true };
        const res = createRes();

        await eventsController.createEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('create error');
    });

    it('updateEvent returns updated event', async () => {
        eventService.updateEvent.mockResolvedValue({ title: 'Updated event' });

        const req = { params: { id: '1' }, body: { title: 'Updated event' }, isAdmin: true };
        const res = createRes();

        await eventsController.updateEvent(req, res);

        expect(res.json).toHaveBeenCalledWith({ title: 'Updated event' });
    });

    it('updateEvent returns 400 when service throws', async () => {
        eventService.updateEvent.mockImplementation(() => {
            throw new Error('update error');
        });

        const req = { params: { id: '1' }, body: { title: 'Updated event' }, isAdmin: true };
        const res = createRes();

        await eventsController.updateEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('update error');
    });

    it('updateEvent returns 404 when event is missing', async () => {
        eventService.updateEvent.mockResolvedValue(null);

        const req = { params: { id: '1' }, body: { title: 'Updated event' }, isAdmin: true };
        const res = createRes();

        await eventsController.updateEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('updateEvent returns forbidden for non admin', async () => {
        const req = { params: { id: '1' }, body: { title: 'Updated event' }, isAdmin: false };
        const res = createRes();

        await eventsController.updateEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });

    it('removeEvent returns Deleted', async () => {
        eventService.removeEvent.mockResolvedValue({ _id: '1' });

        const req = { params: { id: '1' }, isAdmin: true };
        const res = createRes();

        await eventsController.removeEvent(req, res);

        expect(res.send).toHaveBeenCalledWith('Deleted');
    });

    it('removeEvent returns 404 when missing', async () => {
        eventService.removeEvent.mockResolvedValue(null);

        const req = { params: { id: '1' }, isAdmin: true };
        const res = createRes();

        await eventsController.removeEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Not found');
    });

    it('removeEvent returns forbidden for non admin', async () => {
        const req = { params: { id: '1' }, isAdmin: false };
        const res = createRes();

        await eventsController.removeEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toHaveBeenCalledWith('Forbidden');
    });
});
