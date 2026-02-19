const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const listStudents = async () => {
    try {
        const students = await Student.find({}, 'name studentId');
        console.log('--- VALID STUDENTS ---');
        console.table(students.map(s => ({ Name: s.name, ID: s.studentId, _id: s._id.toString() })));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listStudents();
