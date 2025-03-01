import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    phone: { type: String },
    address: { type: String },

    // Medical history can be an array of previous diagnoses
    medicalHistory: [
        {
            diagnosis: String,
            date: { type: Date, default: Date.now },  // Default date is today
            notes: String
        }
    ],

    // Insurance details (optional, but useful for some systems)
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        coverage: String
    },

    criticalStatus: { type: Boolean, default: false }  // For tracking critical patients
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
