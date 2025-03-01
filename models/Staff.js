import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String },
    phone: { type: String },
    schedule: [{ day: String, shift: String }],
    attendance: [{ date: Date, status: String }]
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;  // ✅ Use export default for ESM compatibility
