import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    // Patient information
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    
    // Doctor/provider information
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    
    // Encounter/Visit information
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    
    // Bill details
    billNumber: { type: String, required: true, unique: true },
    billDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    
    // Services/Items billed
    items: [{ 
        description: String, 
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        cost: Number 
    }],
    
    // Insurance information
    insurance: {
        provider: String,
        policyNumber: String,
        coveragePercent: Number,
        approvalCode: String,
        claimStatus: { type: String, enum: ['pending', 'approved', 'denied', 'partially approved'] }
    },
    
    // Financial details
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    patientResponsibility: { type: Number },
    insuranceCoverage: { type: Number },
    
    // Payment information
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'], 
        default: 'pending' 
    },
    paymentDue: { type: Number },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String,
        transactionId: String,
        notes: String
    }],
    
    // Administrative fields
    department: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Virtual field for calculating if bill is overdue
billSchema.virtual('isOverdue').get(function() {
    return this.dueDate < new Date() && this.paymentStatus !== 'paid';
});

// Pre-save middleware to calculate totals
billSchema.pre('save', function(next) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => sum + item.cost, 0);
    
    // Ensure totalAmount is calculated if not manually set
    if (!this.totalAmount) {
        this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
    }
    
    next();
});

// Index for efficient queries
billSchema.index({ patientId: 1, billDate: -1 });
billSchema.index({ billNumber: 1 }, { unique: true });
billSchema.index({ paymentStatus: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;