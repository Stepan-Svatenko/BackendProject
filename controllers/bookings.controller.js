const bookingService = require('../service/BookingService');

async function listBookings(req, res) {
    const bookings = await bookingService.getBookings();
    return res.json(bookings);
}

async function getBooking(req, res) {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).send('Not found');
    return res.json(booking);
}

async function createBooking(req, res) {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send('Empty body');
        }
        const booking = await bookingService.createBooking(req.body);
        return res.status(201).json(booking);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function updateBooking(req, res) {
    try {
        const booking = await bookingService.updateBooking(req.params.id, req.body);
        if (!booking) return res.status(404).send('Not found');
        return res.json(booking);
    } catch (err) {
        return res.status(400).send(err.message);
    }
}

async function removeBooking(req, res) {
    const booking = await bookingService.removeBooking(req.params.id);
    if (!booking) return res.status(404).send('Not found');
    return res.send('Deleted');
}

module.exports = { listBookings, getBooking, createBooking, updateBooking, removeBooking };
