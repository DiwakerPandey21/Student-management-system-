const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getPaymentStats, getStudentStats, createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getPayments)
    .post(protect, admin, createPayment);

router.route('/stats').get(protect, admin, getPaymentStats);
router.route('/stats/:studentId').get(protect, admin, getStudentStats);
router.route('/order').post(protect, admin, createOrder);
router.route('/verify').post(protect, admin, verifyPayment);

module.exports = router;
