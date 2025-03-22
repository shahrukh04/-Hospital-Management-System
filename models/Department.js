import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    head: { 
        name: { type: String },
        contactNumber: { type: String }
    },
    location: { 
        building: String,
        floor: String,
        roomNumbers: [String]
    },
    staffCount: { type: Number, default: 0 },
    specialties: [String],
    active: { type: Boolean, default: true },
    budget: {
        allocated: { type: Number },
        spent: { type: Number, default: 0 }
    }
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);

export default Department;