import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },
    medicalHistory: [{ diagnosis: String, date: Date, notes: String }],
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        coverage: String
    },
    criticalStatus: { type: Boolean, default: false }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
