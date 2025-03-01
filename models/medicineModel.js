import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    expiryDate: { type: Date },
    manufacturer: { type: String },
    price: { type: Number },
    stock: { type: Number }
}, { timestamps: true });

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
