const mongoose = require('mongoose');

const DeleteLogSchema = new mongoose.Schema({
    documentId: mongoose.Schema.Types.ObjectId,
    documentType: String,
    deletedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DeleteLog', DeleteLogSchema);
