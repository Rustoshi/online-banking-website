#!/usr/bin/env npx ts-node

/**
 * Create Admin Script
 * Usage: npx ts-node scripts/create-admin.ts <email> <password>
 * Example: npx ts-node scripts/create-admin.ts admin@example.com secretpassword123
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables
const MONGODB_URI = 'mongodb+srv://root:%40Newpass12@cluster0.sznor6a.mongodb.net/oakweltrust';

// Admin Schema (must match src/models/Admin.ts)
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'support'], default: 'admin' },
  permissions: [{ type: String }],
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  twoFactorEnabled: { type: Boolean, default: false },
  lastLogin: { type: Date },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin(email: string, password: string) {
  try {
    // Validate inputs
    if (!email || !password) {
      console.error('❌ Error: Email and password are required');
      console.log('\nUsage: npx ts-node scripts/create-admin.ts <email> <password>');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error(`❌ Error: Admin with email "${email}" already exists`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      name: email.split('@')[0], // Use email prefix as name
      email,
      password: hashedPassword,
      role: 'super_admin',
      permissions: ['all'],
      status: 'active',
    });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Name:     ${admin.name}`);
    console.log(`   Role:     ${admin.role}`);
    console.log(`   ID:       ${admin._id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login at /admin/login');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get arguments
const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

createAdmin(email, password);
