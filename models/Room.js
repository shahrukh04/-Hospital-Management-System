const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true },
    type: { type: String },
    isOccupied: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
