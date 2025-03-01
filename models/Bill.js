import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    items: [{ description: String, cost: Number }],
    totalAmount: { type: Number },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentDetails: { method: String, transactionId: String }
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
