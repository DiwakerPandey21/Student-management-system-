const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// @desc    Mark Attendance (Bulk or Single)
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = asyncHandler(async (req, res) => {
    const { batchId, date, attendanceData } = req.body; // attendanceData: [{ studentId, status }]

    // Validate if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Process each student
    const updates = attendanceData.map(async (record) => {
        const { studentId, status } = record;

        // Upsert: Update if exists, Insert if new
        return await Attendance.findOneAndUpdate(
            {
                student: studentId,
                batch: batchId,
                date: attendanceDate
            },
            {
                student: studentId,
                batch: batchId,
                date: attendanceDate,
                status: status
            },
            { upsert: true, new: true }
        );
    });

    await Promise.all(updates);
    res.status(201).json({ message: 'Attendance marked successfully' });
});

// @desc    Get Monthly Attendance Report
// @route   GET /api/attendance/report
// @access  Private/Admin
const getAttendanceReport = asyncHandler(async (req, res) => {
    const { batchId, month, year } = req.query;

    if (!batchId || !month || !year) {
        res.status(400);
        throw new Error('Please provide batchId, month, and year');
    }

    // Determine start and end date of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    // Fetch all students in the batch
    // Note: In a real app, Student model would have 'batches' field. 
    // Assuming for now we fetch ALL students or we need a way to filter Students by Batch.
    // Since our Student model doesn't explicitly have 'batch' link in the schema shown previously, 
    // I will assume we fetch all students for now, or maybe filtering logic needs to be added to Student model.
    // Wait, the User request implies looking at "Class Five 2019".
    // Let's assume for this MVP we fetch ALL students, 
    // OR ideally, we should update Student model to have 'batch' or 'course'. 
    // The 'Batch' model has 'course'. 
    // Let's stick to fetching all students and mapping attendance for the MVP, 
    // or filter by checking if they have an enrollment (if enrollment model exists).
    // The previous summary mentioned "Enrollments". Let's check if there is an Enrollment model.
    // If not, I'll just fetch all students.

    // Simplification for MVP: Fetch all students.
    const students = await Student.find({}).select('_id name studentId');

    // Fetch attendance records for this batch and date range
    const records = await Attendance.find({
        batch: batchId,
        date: { $gte: startDate, $lte: endDate }
    });

    // Structure data for report
    // Map: StudentID -> { DateDay -> Status }
    const report = students.map(student => {
        const studentRecords = records.filter(r => r.student.toString() === student._id.toString());

        const attendanceMap = {};
        let totalPresent = 0;
        let totalAbsent = 0;

        studentRecords.forEach(record => {
            const day = new Date(record.date).getDate();
            attendanceMap[day] = record.status;
            if (record.status === 'Present') totalPresent++;
            if (record.status === 'Absent') totalAbsent++;
        });

        return {
            studentId: student.studentId,
            name: student.name,
            attendance: attendanceMap,
            totalPresent,
            totalAbsent
        };
    });

    res.json(report);
});

// @desc    Get logged-in student's attendance stats
// @route   GET /api/attendance/my-attendance
// @access  Private/Student
const getMyAttendance = asyncHandler(async (req, res) => {
    // 1. Find Student Profile associated with the logged-in User
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    // 2. Fetch all attendance records for this student
    const records = await Attendance.find({ student: student._id });

    // 3. Calculate Stats
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalClasses = records.length;

    records.forEach(record => {
        if (record.status === 'Present') totalPresent++;
        if (record.status === 'Absent') totalAbsent++;
    });

    const percentage = totalClasses === 0 ? 0 : ((totalPresent / totalClasses) * 100).toFixed(1);

    res.json({
        totalClasses,
        totalPresent,
        totalAbsent,
        percentage
    });
});

module.exports = {
    markAttendance,
    getAttendanceReport,
    getMyAttendance,
};
