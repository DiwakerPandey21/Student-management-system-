const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
        totalStudents,
        totalCourses,
        totalBatches,
        totalUsers
    });
});

module.exports = { getStats };
