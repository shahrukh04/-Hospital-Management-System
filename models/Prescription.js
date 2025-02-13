const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patientName: { type: String, required: true },
  medicines: [{ type: String, required: true }],
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
