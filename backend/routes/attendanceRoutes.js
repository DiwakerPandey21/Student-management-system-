const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceReport, getMyAttendance } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, admin, markAttendance);
router.route('/report').get(protect, admin, getAttendanceReport);
router.route('/my-attendance').get(protect, getMyAttendance);

module.exports = router;
