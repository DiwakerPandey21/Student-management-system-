const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({}).populate('user', 'name email role');
    res.json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin (or Student self)
const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).populate('user', 'name email');

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Create a student profile
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
    const { user, studentId, name, email, phone, address, gender, dob } = req.body;

    const studentExists = await Student.findOne({ studentId });

    if (studentExists) {
        res.status(400);
        throw new Error('Student ID already exists');
    }

    const student = await Student.create({
        user,
        studentId,
        name,
        email,
        phone,
        address,
        gender,
        dob,
    });

    res.status(201).json(student);
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        student.name = req.body.name || student.name;
        student.email = req.body.email || student.email;
        student.phone = req.body.phone || student.phone;
        student.address = req.body.address || student.address;
        student.gender = req.body.gender || student.gender;
        student.dob = req.body.dob || student.dob;

        // Update other fields as needed

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
});

// @desc    Get current student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });

    if (student) {
        res.json(student);
    } else {
        res.status(404);
        throw new Error('Student profile not found');
    }
});

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentProfile,
};
