const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        venue: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        eventDate: { type: Date, required: true },
        price: { type: Number, required: true, min: 0 },
        totalSeats: { type: Number, required: true, min: 1 },
        availableSeats: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            required: true,
            enum: ['draft', 'published', 'cancelled', 'sold_out'],
            default: 'draft',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
