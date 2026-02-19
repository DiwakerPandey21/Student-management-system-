const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
const Attendance = require('./models/Attendance');

dotenv.config();

connectDB();

const seedAttendance = async () => {
    try {
        await Attendance.deleteMany();

        const students = await Student.find({});
        const batches = await Batch.find({});

        if (students.length === 0 || batches.length === 0) {
            console.log('No students or batches found. Please seed them first.');
            process.exit(1);
        }

        const batch = batches[0]; // Seed for the first batch
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const attendanceRecords = [];

        students.forEach(student => {
            for (let day = 1; day <= daysInMonth; day++) {
                // Skip weekends (randomly simulate)
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat

                if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

                const status = Math.random() > 0.1 ? 'Present' : 'Absent'; // 90% attendance

                attendanceRecords.push({
                    student: student._id,
                    batch: batch._id,
                    date: date,
                    status: status
                });
            }
        });

        await Attendance.insertMany(attendanceRecords);

        console.log('Attendance Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedAttendance();
