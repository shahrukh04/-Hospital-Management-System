import PatientRecord from '../models/PatientRecord.js';
import Patient from '../models/patientModel.js';
import mongoose from 'mongoose';

// Get all records for a specific patient
export const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { recordType, startDate, endDate, status } = req.query;

    // Build query
    const query = { patient: patientId };
    
    // Add filters if provided
    if (recordType) query.recordType = recordType;
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Check if patient exists
    const patientExists = await Patient.exists({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if the requesting user has access to this patient's records
    if (req.user.role !== 'admin' && req.user.role !== 'doctor' && req.user.role !== 'nurse') {
      // If patient is accessing their own records
      if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Fetch records
    const records = await PatientRecord.find(query)
      .populate('createdBy', 'name role')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch patient records',
      error: error.message 
    });
  }
};

// Get a specific record by ID
export const getRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const record = await PatientRecord.findById(recordId)
      .populate('createdBy', 'name role')
      .populate('patient', 'name dateOfBirth');

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch record',
      error: error.message 
    });
  }
};

// Create a new record
export const createRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { recordType, description, confidential, metadata, attachments } = req.body;

    // Check if patient exists
    const patientExists = await Patient.exists({ _id: patientId });
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const newRecord = new PatientRecord({
      patient: patientId,
      recordType,
      description,
      confidential: confidential || false,
      metadata,
      attachments,
      createdBy: req.user._id
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: newRecord
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create record',
      error: error.message 
    });
  }
};

// Update a record
export const updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.patient;
    delete updateData.createdBy;

    const updatedRecord = await PatientRecord.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update record',
      error: error.message 
    });
  }
};

// Delete a record
export const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const record = await PatientRecord.findById(recordId);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    // Check if user has permission to delete
    if (req.user.role !== 'admin' && record.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to delete this record' });
    }
    
    await PatientRecord.findByIdAndDelete(recordId);
    
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete record',
      error: error.message 
    });
  }
};

// Get record stats
export const getRecordStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const stats = await PatientRecord.aggregate([
      { $match: { patient: mongoose.Types.ObjectId.createFromHexString(patientId) } },
      { $group: { 
        _id: '$recordType',
        count: { $sum: 1 },
        latest: { $max: '$date' }
      }},
      { $sort: { latest: -1 } }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch record statistics',
      error: error.message 
    });
  }
};

export default {
  getPatientRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordStats
};