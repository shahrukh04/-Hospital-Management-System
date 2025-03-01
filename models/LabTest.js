import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    testName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    results: { type: String }
}, { timestamps: true });

// ESM uses `export default` instead of `module.exports`
const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
