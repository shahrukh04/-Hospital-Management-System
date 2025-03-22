import LabTest from '../models/LabTest.js';
import Patient from '../models/patientModel.js';
import mongoose from 'mongoose';

// Get all lab results
export const getResults = async (req, res) => {
  try {
    const { patientId, status, dateFrom, dateTo } = req.query;

    // Build query object
    const query = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Fetch lab results with populated fields
    const results = await LabTest.find(query)
      .populate('patient', 'name age gender')
      .populate('orderedBy', 'name')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error fetching lab results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lab results',
      error: error.message
    });
  }
};

// Get all lab tests
export const getAllLabTests = async (req, res) => {
  try {
    const labTests = await LabTest.find()
      .populate('patient', 'name')
      .populate('orderedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: labTests.length,
      data: labTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab tests',
      error: error.message
    });
  }
};

// Get a specific lab test
export const getLabTest = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patient', 'name age gender contactNumber')
      .populate('orderedBy', 'name')
      .populate('performedBy', 'name');

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab test',
      error: error.message
    });
  }
};

// Order a new lab test
export const orderLabTest = async (req, res) => {
  try {
    const {
      patient,
      testType,
      urgency,
      instructions,
      clinicalInfo
    } = req.body;

    // Verify patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const newLabTest = new LabTest({
      patient,
      testType,
      urgency: urgency || 'routine',
      instructions,
      clinicalInfo,
      orderedBy: req.user._id,
      status: 'ordered',
      orderDate: new Date()
    });

    await newLabTest.save();

    res.status(201).json({
      success: true,
      message: 'Lab test ordered successfully',
      data: newLabTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to order lab test',
      error: error.message
    });
  }
};

// Update lab test status and results
export const updateLabTestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results, notes, performedBy } = req.body;

    const updateData = {
      status,
      notes
    };

    // Add results if provided
    if (results) {
      updateData.results = results;
    }

    // Add performedBy if provided or use current user
    if (status === 'completed') {
      updateData.performedBy = performedBy || req.user._id;
      updateData.completedAt = new Date();
    }

    const updatedLabTest = await LabTest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'name')
     .populate('orderedBy', 'name')
     .populate('performedBy', 'name');

    if (!updatedLabTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lab test updated successfully',
      data: updatedLabTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lab test',
      error: error.message
    });
  }
};

// Delete a lab test
export const deleteLabTest = async (req, res) => {
  try {
    const { id } = req.params;

    const labTest = await LabTest.findById(id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Only allow deletion of tests that aren't completed
    if (labTest.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed lab tests cannot be deleted'
      });
    }

    await LabTest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Lab test deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lab test',
      error: error.message
    });
  }
};

// Get lab tests stats
export const getLabStats = async (req, res) => {
  try {
    const [
      testsByStatus,
      testsByType,
      recentTests
    ] = await Promise.all([
      // Group by status
      LabTest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Group by test type
      LabTest.aggregate([
        { $group: { _id: '$testType', count: { $sum: 1 } } }
      ]),
      // Get recent tests
      LabTest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name')
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: testsByStatus,
        byType: testsByType,
        recent: recentTests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab statistics',
      error: error.message
    });
  }
};

// Export both named exports and default export
export default {
  getResults,
  getAllLabTests,
  getLabTest,
  orderLabTest,
  updateLabTestStatus,
  deleteLabTest,
  getLabStats
};