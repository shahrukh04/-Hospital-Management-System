import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  recordType: {
    type: String,
    required: true,
    enum: ['Diagnosis', 'Lab Result', 'Prescription', 'Treatment', 'Progress Note', 'Vital Signs']
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  confidential: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Pending Review'],
    default: 'Active'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Create a compound index on patient and date for efficient querying
recordSchema.index({ patient: 1, date: -1 });

const PatientRecord = mongoose.model('PatientRecord', recordSchema);

export default PatientRecord;