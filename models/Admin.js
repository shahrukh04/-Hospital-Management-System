// models/Admin.js
import mongoose from "mongoose";
import User from "./User.js";

const AdminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    enum: ['IT', 'Finance', 'HR', 'Operations', 'General'],
    default: 'General'
  },
  accessLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  permissions: [{
    type: String,
    enum: [
      'view_all', 
      'manage_users', 
      'manage_doctors', 
      'manage_patients',
      'manage_staff', 
      'manage_billing', 
      'manage_pharmacy',
      'manage_laboratory',
      'system_settings'
    ]
  }],
  dateAppointed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;