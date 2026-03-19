import mongoose from 'mongoose';
import { MONGODB_URI, MONGODB_DB } from './env.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function connectToDatabase() {
  const mongoUri = MONGODB_URI;
  
  mongoose.set('strictQuery', true);
  
  try {
    await mongoose.connect(mongoUri, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

export function getDatabaseState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState;
}

export async function ensureDatabaseConnectedWithRetry(maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries && mongoose.connection.readyState !== 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await connectToDatabase();
      break;
    } catch (error) {
      attempt += 1;
      
      if (attempt >= maxRetries) {
        console.error('Database connection failed after all retries');
        throw new Error('Database connection failed');
      }
      
      const backoffMs = Math.min(5000, 1000 * attempt);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

export async function seedDatabase() {
  try {
    const adminEmail = 'admin@hosteleease.com';
    const wardenEmail = 'warden@hosteleease.com';
    const studentEmail = 'student@hosteleease.com';

    // Create admin user
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        passwordHash,
        role: 'Admin',
        isVerified: true, // Admin is verified by default
      });
      console.log(`Seeded admin user: ${adminEmail}`);
    }

    // Create warden user
    let wardenUser = await User.findOne({ email: wardenEmail });
    if (!wardenUser) {
      const passwordHash = await bcrypt.hash('warden123', 10);
      wardenUser = await User.create({
        name: 'Warden User',
        email: wardenEmail,
        passwordHash,
        role: 'Warden',
        hostelBlock: 'Block A',
        isVerified: true, // Warden is verified by default
      });
      console.log(`Seeded warden user: ${wardenEmail}`);
    }

    // Create student user
    let studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
      const passwordHash = await bcrypt.hash('student123', 10);
      studentUser = await User.create({
        name: 'Student User',
        email: studentEmail,
        passwordHash,
        role: 'Student',
        hostelBlock: 'Block A',
        room: '101',
        isVerified: true, // Student is verified for demo purposes
      });
      console.log(`Seeded student user: ${studentEmail}`);
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}


