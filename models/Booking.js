const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            default: () => `BK-${Date.now()}`,
        },
        event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        ticketCount: { type: Number, required: true, min: 1, default: 1 },
        ticketType: {
            type: String,
            required: true,
            enum: ['standard', 'vip', 'student', 'child'],
            default: 'standard',
        },
        bookingStatus: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['unpaid', 'paid', 'failed', 'refunded'],
            default: 'unpaid',
        },
        priceAtBooking: { type: Number, min: 0 },
        totalPrice: { type: Number, min: 0 },
        currency: { type: String, required: true, default: 'UAH', trim: true },
        passengerName: { type: String, required: true, trim: true },
        passengerPhone: { type: String, required: true, trim: true },
        ticketQRCode: { type: String, trim: true, default: () => `QR-${Date.now()}` },
        isUsed: { type: Boolean, default: false },
        isForResale: { type: Boolean, default: false },
        resalePrice: { type: Number, default: null, min: 0 },
        resaleStatus: {
            type: String,
            enum: ['not_listed', 'listed', 'reserved', 'sold'],
            default: 'not_listed',
        },
        canBeCancelled: { type: Boolean, default: true },
    },
    { timestamps: true },
);

BookingSchema.methods.isCancelable = function isCancelable() {
    return this.canBeCancelled && this.bookingStatus !== 'cancelled';
};

BookingSchema.methods.isPaid = function isPaid() {
    return this.paymentStatus === 'paid';
};

BookingSchema.methods.isActive = function isActive() {
    return ['pending', 'confirmed'].includes(this.bookingStatus);
};

BookingSchema.statics.findByEvent = function findByEvent(eventId) {
    return this.find({ event: eventId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Booking', BookingSchema);
