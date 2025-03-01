import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },  // Doctor's field (Cardiology, etc.)
    email: { type: String, required: true, unique: true },
}, { timestamps: true });  // ✅ createdAt and updatedAt will be auto-added

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
