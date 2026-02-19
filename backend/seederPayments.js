const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Payment = require('./models/Payment');

dotenv.config();

connectDB();

const seedPayments = async () => {
    try {
        await Payment.deleteMany();

        const students = await Student.find({});
        const courses = await Course.find({});

        if (students.length === 0) {
            console.log('No students found. Please seed them first.');
            process.exit(1);
        }

        const student = students[0];
        const course = courses[0];

        const payments = [
            {
                student: student._id,
                course: course?._id,
                amount: 600,
                paymentType: 'Monthly Fee',
                month: 'February',
                year: 2019, // Matching reference image
                status: 'Paid',
                receiptNo: `REC-${Date.now()}-1`,
                receivedBy: 'Admin'
            },
            {
                student: student._id,
                course: course?._id,
                amount: 700,
                paymentType: 'Monthly Fee',
                month: 'December',
                year: 2018, // Matching reference image
                status: 'Due',
                receiptNo: `REC-${Date.now()}-2`,
                receivedBy: 'Admin'
            },
            // Add some more recent ones
            {
                student: student._id,
                course: course?._id,
                amount: 500,
                paymentType: 'Exam Fee',
                month: 'March',
                year: 2024,
                status: 'Paid',
                receiptNo: `REC-${Date.now()}-3`,
                receivedBy: 'Admin'
            }
        ];

        await Payment.insertMany(payments);

        console.log('Payment Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedPayments();
