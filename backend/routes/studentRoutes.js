const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentProfile
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getStudents).post(protect, admin, createStudent);
router.get('/profile', protect, getStudentProfile);
router
    .route('/:id')
    .get(protect, getStudentById)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

module.exports = router;
