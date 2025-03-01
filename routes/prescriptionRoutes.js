import express from "express";
import {
    getPrescriptions,
    getPrescriptionCount,
    addPrescription,
    updatePrescription,
    deletePrescription
} from "../controllers/prescriptionController.js";

const router = express.Router();

/**
 * @route GET /api/prescriptions/
 * @desc Get all prescriptions (with populated doctor info)
 */
router.get("/", getPrescriptions);

/**
 * @route GET /api/prescriptions/count
 * @desc Get total number of prescriptions
 */
router.get("/count", getPrescriptionCount);

/**
 * @route POST /api/prescriptions/
 * @desc Create a new prescription
 * @body { doctorId, patientName, patientAge, instructions, medicines }
 */
router.post("/", addPrescription);

/**
 * @route PUT /api/prescriptions/:id
 * @desc Update a prescription by ID
 * @body { patientName, patientAge, instructions, medicines }
 */
router.put("/:id", updatePrescription);

/**
 * @route DELETE /api/prescriptions/:id
 * @desc Delete a prescription by ID
 */
router.delete("/:id", deletePrescription);

export default router;
