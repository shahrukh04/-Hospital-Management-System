import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'patient', 'reception', 'nurse', 'lab_technician', 'pharmacist'],
    default: 'patient'
  },
  name: { type: String, required: true }, // Changed from firstName and lastName to name
  phone: { type: String },
  created: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate default email based on role
UserSchema.methods.generateDefaultEmail = function() {
  const baseName = this.name.toLowerCase().replace(/\s+/g, '.'); // Use name instead of firstName and lastName

  switch(this.role) {
    case 'admin':
      return `${baseName}@admin.hospital.com`;
    case 'doctor':
      return `${baseName}@doctors.hospital.com`;
    case 'patient':
      return `${baseName}@patients.hospital.com`;
    case 'reception':
      return `${baseName}@reception.hospital.com`;
    case 'nurse':
      return `${baseName}@nursing.hospital.com`;
    case 'lab_technician':
      return `${baseName}@lab.hospital.com`;
    case 'pharmacist':
      return `${baseName}@pharmacy.hospital.com`;
    default:
      return `${baseName}@hospital.com`;
  }
};

// Set default email if not provided
UserSchema.pre("validate", function(next) {
  if (!this.email) {
    this.email = this.generateDefaultEmail();
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;