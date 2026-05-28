jest.mock('../models/Event', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));

jest.mock('mongoose', () => ({
    isValidObjectId: jest.fn(),
}));

const mongoose = require('mongoose');
const Event = require('../models/Event');
const eventService = require('../service/EventService');

describe('EventService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('createEvent creates event', async () => {
        Event.create.mockResolvedValue({ title: 'Rock Concert' });

        const result = await eventService.createEvent({ title: 'Rock Concert' });

        expect(result).toEqual({ title: 'Rock Concert' });
        expect(Event.create).toHaveBeenCalledWith({ title: 'Rock Concert' });
    });

    it('getEvents sorts by eventDate', async () => {
        const sort = jest.fn().mockResolvedValue([{ title: 'A' }]);
        Event.find.mockReturnValue({ sort });

        const result = await eventService.getEvents();

        expect(Event.find).toHaveBeenCalledWith();
        expect(sort).toHaveBeenCalledWith({ eventDate: 1 });
        expect(result).toEqual([{ title: 'A' }]);
    });

    it('getEventById returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await eventService.getEventById('bad');

        expect(result).toBeNull();
        expect(Event.findById).not.toHaveBeenCalled();
    });

    it('getEventById finds event for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Event.findById.mockResolvedValue({ _id: '1' });

        const result = await eventService.getEventById('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });

    it('updateEvent returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await eventService.updateEvent('bad', { title: 'x' });

        expect(result).toBeNull();
        expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('updateEvent updates event for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Event.findByIdAndUpdate.mockResolvedValue({ _id: '1', title: 'Updated' });

        const result = await eventService.updateEvent('507f1f77bcf86cd799439011', { title: 'Updated' });

        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            { title: 'Updated' },
            { new: true, runValidators: true },
        );
        expect(result).toEqual({ _id: '1', title: 'Updated' });
    });

    it('removeEvent returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await eventService.removeEvent('bad');

        expect(result).toBeNull();
        expect(Event.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('removeEvent deletes event for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Event.findByIdAndDelete.mockResolvedValue({ _id: '1' });

        const result = await eventService.removeEvent('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });
});
