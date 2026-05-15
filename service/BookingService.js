const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');

async function createBooking(data) {
    const session = await mongoose.startSession();

    try {
        let createdBooking;

        await session.withTransaction(async () => {
            const event = await Event.findById(data.event).session(session);
            if (!event) {
                throw new Error('Event not found');
            }

            if (event.status === 'cancelled') {
                throw new Error('Event is cancelled');
            }

            if (event.availableSeats <= 0) {
                throw new Error('No available seats');
            }

            if (data.seatNumber > event.totalSeats) {
                throw new Error('Seat number exceeds event capacity');
            }

            const existingSeat = await Booking.findOne({
                event: event._id,
                seatNumber: data.seatNumber,
                bookingStatus: { $ne: 'cancelled' },
            }).session(session);

            if (existingSeat) {
                throw new Error('Seat already booked');
            }

            const user = await User.findById(data.user).session(session);
            if (!user) {
                throw new Error('User not found');
            }

            createdBooking = await Booking.create([data], { session }).then((docs) => docs[0]);

            event.availableSeats -= 1;
            if (event.availableSeats === 0) {
                event.status = 'sold_out';
            }
            await event.save({ session });
        });

        return createdBooking;
    } finally {
        session.endSession();
    }
}

async function getBookings() {
    return Booking.find().populate('event').populate('user').sort({ createdAt: -1 });
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
