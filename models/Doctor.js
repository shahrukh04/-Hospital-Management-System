import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });  // ✅ Adds createdAt and updatedAt automatically

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
