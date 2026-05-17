const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\+?[0-9]{10,15}$/, 'Invalid phone format'],
        },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin', 'organizer'],
            default: 'user',
        },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true },
);

UserSchema.methods.isBlockedUser = function isBlockedUser() {
    return this.isBlocked === true;
};

UserSchema.methods.isAdmin = function isAdmin() {
    return this.role === 'admin';
};

UserSchema.methods.isOrganizer = function isOrganizer() {
    return this.role === 'organizer';
};

UserSchema.statics.findByEmail = function findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', UserSchema);
