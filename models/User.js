const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        email: { type: String, required: true, trim: true, unique: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin', 'organizer'],
            default: 'user',
        },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
