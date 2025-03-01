import mongoose from 'mongoose';

const BedSchema = new mongoose.Schema({
    number: { type: String, required: true },
    ward: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['occupied', 'available'], default: 'available' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null }
}, { timestamps: true });

const Bed = mongoose.model('Bed', BedSchema);
export default Bed;
