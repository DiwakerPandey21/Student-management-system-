const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Batch = require('./models/Batch');
const Attendance = require('./models/Attendance');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Attendance.deleteMany();
        await Batch.deleteMany();
        await Course.deleteMany();
        await Student.deleteMany();
        await User.deleteMany();

        // 1. Create Users
        const users = [
            {
                name: 'Admin User',
                email: 'admin@school.com',
                password: 'password123',
                role: 'admin',
            },
            {
                name: 'Jane Student',
                email: 'jane@school.com',
                password: 'password123',
                role: 'student',
            }
        ];
        const createdUsers = await User.create(users);
        const adminUser = createdUsers[0];
        const studentUser1 = createdUsers[1];
        const studentUser2 = createdUsers[2];

        // 2. Create Students
        const students = await Student.create([
            {
                user: studentUser1._id,
                studentId: 'STU001',
                name: studentUser1.name,
                email: studentUser1.email,
                phone: '1234567890',
                address: '123 School Lane',
                gender: 'Male',
                dob: new Date('2000-01-01'),
            },
            {
                user: studentUser2._id,
                studentId: 'STU002',
                name: 'Jane Doe',
                email: 'jane@school.com',
                phone: '0987654321',
                address: '456 College Ave',
                gender: 'Female',
                dob: new Date('2001-02-02'),
            }
        ]);

        // 3. Create Courses
        const course = await Course.create({
            courseName: 'Computer Science',
            courseCode: 'CS101',
            description: 'Introduction to CS',
            duration: '4 Years'
        });

        // 4. Create Batches
        const batch = await Batch.create({
            batchName: 'Class CS 2026',
            course: course._id,
            year: 2026,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31')
        });

        // 5. Create Attendance for current month
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const attendanceRecords = [];

        students.forEach(student => {
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();

                if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

                const status = Math.random() > 0.1 ? 'Present' : 'Absent';

                attendanceRecords.push({
                    student: student._id,
                    batch: batch._id,
                    date: date,
                    status: status
                });
            }
        });

        await Attendance.insertMany(attendanceRecords);

        console.log('Full Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
