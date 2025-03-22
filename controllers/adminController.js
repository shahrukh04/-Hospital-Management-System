// controllers/adminController.js
import Admin from "../models/Admin.js";
import User from "../models/User.js";
// import Doctor from "../models/Doctor.js";
import Patient from "../models/patientModel.js";
import Appointment from "../models/Appointment.js";
import Bill from "../models/Bill.js";

// Get admin dashboard data
export const getDashboard = async (req, res) => {
  try {
    // Get counts for dashboard summary
    const [
      doctorCount,
      patientCount,
      appointmentCount,
      todayAppointments,
      pendingBills
    ] = await Promise.all([
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'patient', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59))
        }
      }),
      Billing.countDocuments({ status: 'pending' })
    ]);

    // Get recent patients
    const recentPatients = await Patient.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      date: { $gte: new Date() }
    })
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .sort({ date: 1 })
      .limit(10);

    // Admin-specific information
    const adminDetails = await Admin.findOne({ 
      user: req.user._id 
    }).populate('user', 'name email lastLogin');

    res.json({
      success: true,
      data: {
        adminDetails,
        counts: {
          doctors: doctorCount,
          patients: patientCount,
          appointments: appointmentCount,
          todayAppointments,
          pendingBills
        },
        recentPatients,
        upcomingAppointments
      }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
      error: error.message
    });
  }
};

// Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({
      role: { $in: ['doctor', 'nurse', 'reception', 'lab_technician', 'pharmacist'] }
    }).select('-password');

    res.json({
      success: true,
      count: staffMembers.length,
      data: staffMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff members",
      error: error.message
    });
  }
};

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const { userId, department, accessLevel, permissions } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ user: userId });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is already an admin"
      });
    }

    // Update user role
    user.role = 'admin';
    await user.save();

    // Create admin profile
    const admin = new Admin({
      user: userId,
      department,
      accessLevel,
      permissions
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message
    });
  }
};

// System statistics for admin
export const getSystemStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get various statistics
    const [
      totalRevenue,
      monthlyRevenue,
      appointmentsCompleted,
      usersByRole
    ] = await Promise.all([
      Billing.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Billing.aggregate([
        { 
          $match: { 
            status: 'paid',
            updatedAt: { $gte: startOfMonth } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Appointment.countDocuments({ status: 'completed' }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0
        },
        appointments: {
          completed: appointmentsCompleted
        },
        users: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
      error: error.message
    });
  }
};

export default {
  getDashboard,
  getAllStaff,
  createAdmin,
  getSystemStats
};