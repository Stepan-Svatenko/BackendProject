jest.mock('../models/Booking', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));

jest.mock('../models/Event', () => ({
    findById: jest.fn(),
}));

jest.mock('mongoose', () => ({
    startSession: jest.fn(),
    isValidObjectId: jest.fn(),
}));

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const bookingService = require('../service/BookingService');

function createSession() {
    return {
        withTransaction: jest.fn(async fn => fn()),
        endSession: jest.fn(),
    };
}

describe('BookingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mongoose.startSession.mockResolvedValue(createSession());
    });

    it('createBooking throws when event not found', async () => {
        Event.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(null),
        });

        await expect(
            bookingService.createBooking({
                event: '507f1f77bcf86cd799439011',
                user: 'user-1',
                ticketCount: 1,
            }),
        ).rejects.toThrow('Event not found');
    });

    it('createBooking throws when event is not bookable', async () => {
        const event = {
            isBookable: jest.fn().mockReturnValue(false),
            availableSeats: 10,
            price: 100,
            markSoldOut: jest.fn(),
            save: jest.fn(),
        };
        Event.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(event),
        });

        await expect(
            bookingService.createBooking({
                event: '507f1f77bcf86cd799439011',
                user: 'user-1',
                ticketCount: 1,
            }),
        ).rejects.toThrow('Event is not bookable(sold out or not published)');
    });

    it('createBooking throws when ticket count invalid', async () => {
        const event = {
            isBookable: jest.fn().mockReturnValue(true),
            availableSeats: 10,
            price: 100,
            markSoldOut: jest.fn(),
            save: jest.fn(),
        };
        Event.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(event),
        });

        await expect(
            bookingService.createBooking({
                event: '507f1f77bcf86cd799439011',
                user: 'user-1',
                ticketCount: 0,
            }),
        ).rejects.toThrow('Invalid ticket count');
    });

    it('createBooking throws when not enough seats', async () => {
        const event = {
            isBookable: jest.fn().mockReturnValue(true),
            availableSeats: 1,
            price: 100,
            markSoldOut: jest.fn(),
            save: jest.fn(),
        };
        Event.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(event),
        });

        await expect(
            bookingService.createBooking({
                event: '507f1f77bcf86cd799439011',
                user: 'user-1',
                ticketCount: 2,
            }),
        ).rejects.toThrow('Not enough available seats');
    });

    it('createBooking creates booking and updates event', async () => {
        const event = {
            isBookable: jest.fn().mockReturnValue(true),
            availableSeats: 2,
            price: 100,
            markSoldOut: jest.fn(),
            save: jest.fn().mockResolvedValue(undefined),
        };
        Event.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(event),
        });
        Booking.create.mockResolvedValue([{ _id: 'booking-1' }]);

        const result = await bookingService.createBooking({
            event: '507f1f77bcf86cd799439011',
            user: 'user-1',
            ticketCount: 2,
            passengerName: 'Ivan',
            passengerPhone: '+380501234567',
        });

        expect(Booking.create).toHaveBeenCalled();
        expect(event.availableSeats).toBe(0);
        expect(event.markSoldOut).toHaveBeenCalled();
        expect(event.save).toHaveBeenCalled();
        expect(result).toEqual({ _id: 'booking-1' });
    });

    it('getBookings returns all bookings for admin', async () => {
        const sort = jest.fn().mockResolvedValue([{ bookingId: 'BK-1' }]);
        const populateUser = jest.fn(() => ({ sort }));
        const populateEvent = jest.fn(() => ({ populate: populateUser }));
        Booking.find.mockReturnValue({ populate: populateEvent });

        const result = await bookingService.getBookings('admin-1', true);

        expect(Booking.find).toHaveBeenCalledWith({});
        expect(result).toEqual([{ bookingId: 'BK-1' }]);
    });

    it('getBookings filters by user for regular user', async () => {
        const sort = jest.fn().mockResolvedValue([{ bookingId: 'BK-1' }]);
        const populateUser = jest.fn(() => ({ sort }));
        const populateEvent = jest.fn(() => ({ populate: populateUser }));
        Booking.find.mockReturnValue({ populate: populateEvent });

        const result = await bookingService.getBookings('user-1', false);

        expect(Booking.find).toHaveBeenCalledWith({ user: 'user-1' });
        expect(result).toEqual([{ bookingId: 'BK-1' }]);
    });

    it('getBookingById returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await bookingService.getBookingById('bad');

        expect(result).toBeNull();
        expect(Booking.findById).not.toHaveBeenCalled();
    });

    it('getBookingById finds booking for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Booking.findById.mockReturnValue({
            populate: jest.fn(() => ({ populate: jest.fn().mockResolvedValue({ _id: '1' }) })),
        });

        const result = await bookingService.getBookingById('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });

    it('updateBooking returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await bookingService.updateBooking('bad', { bookingStatus: 'confirmed' });

        expect(result).toBeNull();
        expect(Booking.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('updateBooking updates booking for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Booking.findByIdAndUpdate.mockResolvedValue({ _id: '1', bookingStatus: 'confirmed' });

        const result = await bookingService.updateBooking('507f1f77bcf86cd799439011', {
            bookingStatus: 'confirmed',
        });

        expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011',
            { bookingStatus: 'confirmed' },
            { new: true, runValidators: true },
        );
        expect(result).toEqual({ _id: '1', bookingStatus: 'confirmed' });
    });

    it('removeBooking returns null for invalid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(false);

        const result = await bookingService.removeBooking('bad');

        expect(result).toBeNull();
        expect(Booking.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('removeBooking deletes booking for valid id', async () => {
        mongoose.isValidObjectId.mockReturnValue(true);
        Booking.findByIdAndDelete.mockResolvedValue({ _id: '1' });

        const result = await bookingService.removeBooking('507f1f77bcf86cd799439011');

        expect(result).toEqual({ _id: '1' });
    });
});
