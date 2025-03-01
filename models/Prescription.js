import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientName: { type: String, required: true },
    patientAge: { type: String, required: true },
    instructions: { type: String },
    medicines: [{ type: String, required: true }],  // This expects only array of strings
    status: { type: String, default: "active" },
}, { timestamps: true });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
