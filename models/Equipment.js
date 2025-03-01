const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['working', 'under maintenance', 'out of service'], default: 'working' },
    maintenanceSchedule: [{ date: Date, notes: String }]
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
