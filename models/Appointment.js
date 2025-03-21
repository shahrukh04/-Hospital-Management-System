import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },

    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },

    appointmentType: {
        type: String,
        enum: ['new', 'follow-up', 'emergency', 'routine', 'specialist', 'Consultation', 'Diagnostic', 'Therapy', 'Surgery'],
        required: true
    },

    date: {
        type: Date,
        required: true,
        index: true
    },

    startTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:MM (24-hour format)`
        }
    },

    endTime: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:MM (24-hour format)`
        }
    },

    duration: {
        type: Number,  // Duration in minutes
        min: 5,
        max: 240,
        required: true
    },

    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled',
        index: true
    },

    cancellationReason: {
        type: String,
        required: function() {
            return this.status === 'cancelled';
        }
    },

    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    reason: {
        type: String,
        required: true,
        trim: true
    },

    notes: {
        type: String,
        trim: true
    },

    // Use patient's insurance details instead of storing them directly
    insurance: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        required: false
    },

    payment: {
        status: {
            type: String,
            enum: ['pending', 'completed', 'waived', 'insurance'],
            default: 'pending'
        },
        amount: { type: Number },
        method: { type: String }
    },

    reminders: [{
        type: { type: String, enum: ['email', 'sms', 'phone'] },
        sentAt: { type: Date },
        status: { type: String, enum: ['sent', 'failed', 'pending'] }
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define indexes for common queries
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

// Virtual for getting full patient information
appointmentSchema.virtual('patient', {
    ref: 'Patient',
    localField: 'patientId',
    foreignField: '_id',
    justOne: true
});

// Virtual for getting full doctor information
appointmentSchema.virtual('doctor', {
    ref: 'Doctor',
    localField: 'doctorId',
    foreignField: '_id',
    justOne: true
});

// Adding virtual for department
appointmentSchema.virtual('department', {
    ref: 'Department',
    localField: 'departmentId',
    foreignField: '_id',
    justOne: true
});

// Pre-save middleware to copy insurance details from patient
appointmentSchema.pre('save', async function(next) {
    // Check if this is a new appointment or if we need to update insurance
    if (this.isNew || this.isModified('patientId')) {
        try {
            const Patient = mongoose.model('Patient');
            const patient = await Patient.findById(this.patientId);
            if (patient && patient.insuranceDetails) {
                this.insurance = patient.insuranceDetails;
            } else {
                // Set to empty object if patient has no insurance
                this.insurance = {};
            }
        } catch (error) {
            // If there's an error, set insurance to empty object
            this.insurance = {};
            console.error('Error fetching patient insurance details:', error);
        }
    }
    // Check for overlapping appointments for the doctor
    if (this.isNew || this.isModified('date') || this.isModified('startTime') || this.isModified('endTime')) {
        const overlappingAppointment = await this.constructor.findOne({
            doctorId: this.doctorId,
            date: this.date,
            status: { $nin: ['cancelled', 'no-show'] },
            $or: [
                {
                    startTime: { $lt: this.endTime },
                    endTime: { $gt: this.startTime }
                }
            ],
            _id: { $ne: this._id }
        });

        if (overlappingAppointment) {
            next(new Error('This time slot conflicts with an existing appointment'));
        }
    }
    next();
});

// Instance methods
appointmentSchema.methods.cancel = async function(reason, userId) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.updatedBy = userId;
    return this.save();
};

// Static methods
appointmentSchema.statics.findByPatient = function(patientId) {
    return this.find({ patientId }).sort({ date: -1, startTime: -1 });
};

appointmentSchema.statics.findByDoctor = function(doctorId, date) {
    const query = { doctorId };
    if (date) query.date = date;
    return this.find(query).sort({ date: 1, startTime: 1 });
};

appointmentSchema.statics.findUpcoming = function(limit = 10) {
    const now = new Date();
    return this.find({
        date: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(limit)
    .populate('patient', 'name phone insuranceDetails')
    .populate('doctor', 'name specialization')
    .populate('department');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;