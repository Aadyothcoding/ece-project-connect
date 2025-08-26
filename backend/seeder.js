import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import csv from 'csv-parser'; // ✅ Import the new CSV parser package
import User from './models/auth.models.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for Seeding');
  } catch (err) {
    console.error(`❌ Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const seedTeachers = async () => {
  try {
    await connectDB();

    const results = [];
    const filePath = path.resolve("/Users/aadyothsreeram/Documents/personal_projects/ece-proj-connect/backend/faculty email id.csv");

    // ✅ Read and parse the CSV file
    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv({
              // This tells the parser to skip the first 5 header lines in your file
              skipLines: 5,
              // This maps the CSV headers to easier-to-use keys
              mapHeaders: ({ header }) => {
                  if (header === 'Name of the Staff') return 'fullName';
                  if (header === 'userID@srmist.edu.in') return 'userId';
                  return header;
              }
          }))
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
    });

    if (results.length === 0) {
      console.log('No valid faculty data found in faculty-data.csv. Exiting.');
      return;
    }

    console.log(`Found ${results.length} faculty records to process...`);

    for (const faculty of results) {
      // ✅ Use the parsed fullName and construct the email
      const fullName = faculty.fullName?.trim();
      const email = faculty.userId ? `${faculty.userId.trim()}@srmist.edu.in` : null;

      if (!fullName || !email) {
        console.log(`🟡 Skipping invalid record:`, faculty);
        continue;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`🟡 Skipping: User with email ${email} already exists.`);
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const teacher = new User({
        fullName,
        email,
        password: hashedPassword,
        role: 'teacher',
        isVerified: true,
      });

      await teacher.save();
      console.log(`🟢 Created teacher: ${fullName} (${email})`);
    }

    console.log('\n✅ Seeding complete!');

  } catch (error) {
    console.error(`❌ Error during seeding: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected');
    process.exit();
  }
};

seedTeachers();