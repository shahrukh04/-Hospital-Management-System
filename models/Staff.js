import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true,
        unique: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String 
    },
    dateOfBirth: { 
        type: Date 
    },
    hireDate: { 
        type: Date, 
        default: Date.now 
    },
    schedule: [{ 
        day: { 
            type: String, 
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
            required: true 
        }, 
        shift: { 
            type: String, 
            enum: ['Morning', 'Afternoon', 'Night'], 
            required: true 
        } 
    }],
    attendance: [{ 
        date: { 
            type: Date, 
            required: true 
        }, 
        status: { 
            type: String, 
            enum: ['Present', 'Absent', 'Late', 'On Leave'], 
            required: true 
        } 
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;