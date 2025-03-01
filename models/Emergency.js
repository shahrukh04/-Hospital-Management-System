import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
    description: { type: String, required: true },
    status: { type: String, enum: ['reported', 'resolved'], default: 'reported' }
}, { timestamps: true });

const Emergency = mongoose.model('Emergency', emergencySchema);

export default Emergency;   // ✅ Use `export default` for ESM
