const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./models/User');
const Student = require('./models/Student');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();

        const users = [
            {
                name: 'Admin User',
                email: 'admin@school.com',
                password: 'password123',
                role: 'admin',
            },
            {
                name: 'Student User',
                email: 'student@school.com',
                password: 'password123',
                role: 'student',
            },
        ];

        const createdUsers = await User.create(users);

        const studentUser = createdUsers[1]; // The student user

        await Student.create({
            user: studentUser._id,
            studentId: 'STU001',
            name: studentUser.name,
            email: studentUser.email,
            phone: '1234567890',
            address: '123 School Lane',
            gender: 'Male',
            dob: new Date('2000-01-01'),
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Student.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
