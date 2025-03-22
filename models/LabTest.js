import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
    default: 'ordered'
  },
  instructions: {
    type: String
  },
  clinicalInfo: {
    type: String
  },
  results: {
    type: mongoose.Schema.Types.Mixed
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  sampleCollectedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  orderedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
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
  referenceRanges: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes for frequent queries
labTestSchema.index({ patient: 1, createdAt: -1 });
labTestSchema.index({ status: 1 });
labTestSchema.index({ testType: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;