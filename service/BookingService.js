const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

async function createBooking(data) {
    const session = await mongoose.startSession();

    try {
        let createdBooking;

        await session.withTransaction(async () => {
            const event = await Event.findById(data.event).session(session);
            if (!event) {
                throw new Error('Event not found');
            }

            if (event.isBookable() === false) {
                throw new Error('Event is not bookable(sold out or not published)');
            }

            const ticketCount = Number(data.ticketCount ?? 1);
            if (!Number.isInteger(ticketCount) || ticketCount < 1) {
                throw new Error('Invalid ticket count');
            }
            if (ticketCount > event.availableSeats) {
                throw new Error('Not enough available seats');
            }

            const totalPrice = Number(event.price) * ticketCount;
            const bookingPayload = {
                ...data,
                user: data.user,
                ticketCount,
                priceAtBooking: event.price,
                totalPrice,
                currency: data.currency || 'UAH',
                ticketQRCode: `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            };

            createdBooking = await Booking.create([bookingPayload], { session }).then(
                docs => docs[0],
            );

            event.availableSeats -= ticketCount;
            if (event.availableSeats === 0) {
                event.markSoldOut();
            }
            await event.save({ session });
        });

        return createdBooking;
    } finally {
        session.endSession();
    }
}

async function getBookings(userId = null, isAdmin = false) {
    const query = isAdmin || !userId ? {} : { user: userId };
    return Booking.find(query).populate('event').populate('user').sort({ createdAt: -1 });
}

async function getBookingById(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Booking.findById(id).populate('event').populate('user');
}

async function updateBooking(id, data) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function removeBooking(id) {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Booking.findByIdAndDelete(id);
}

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    removeBooking,
};
