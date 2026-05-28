const bookingService = require('../service/BookingService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

async function listBookings(req, res) {
    const bookings = await bookingService.getBookings(req.user?.sub, req.isAdmin);
    return res.json(bookings);
}

async function getBooking(req, res) {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) {
        throw new AppError('Not found', 404);
    }
    return res.json(booking);
}

async function createBooking(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError('Empty body', 400);
    }
    if (!req.user || !req.user.sub) {
        throw new AppError('Unauthorized', 401);
    }
    const booking = await bookingService.createBooking({
        ...req.body,
        user: req.user.sub,
    });
    return res.status(201).json(booking);
}

async function updateBooking(req, res) {
    if (!req.isAdmin) {
        throw new AppError('Forbidden', 403);
    }
    const booking = await bookingService.updateBooking(req.params.id, req.body);
    if (!booking) {
        throw new AppError('Not found', 404);
    }
    return res.json(booking);
}

async function removeBooking(req, res) {
    if (!req.isAdmin) {
        throw new AppError('Forbidden', 403);
    }
    const booking = await bookingService.removeBooking(req.params.id);
    if (!booking) {
        throw new AppError('Not found', 404);
    }
    return res.send('Deleted');
}

module.exports = {
    listBookings: asyncHandler(listBookings),
    getBooking: asyncHandler(getBooking),
    createBooking: asyncHandler(createBooking),
    updateBooking: asyncHandler(updateBooking),
    removeBooking: asyncHandler(removeBooking),
};
