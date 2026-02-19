const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with User provided keys
const razorpay = new Razorpay({
    key_id: 'rzp_test_SHvyg3w2dN78OH', // Hardcoded as per user request (should be env in prod)
    key_secret: 'QJy7ikqacKxrVn8Evijmi2Qz'
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    // Build query based on filters
    const query = {};
    if (req.query.studentId) {
        // Find student first to get ObjectId or check if it's already an ObjectId
        // If it's a valid ObjectId, search by _id, else search by custom studentId
        let student;
        if (req.query.studentId.match(/^[0-9a-fA-F]{24}$/)) {
            // It's an ObjectId
            student = await Student.findById(req.query.studentId);
        } else {
            student = await Student.findOne({ studentId: req.query.studentId });
        }

        if (student) {
            query.student = student._id;
        } else {
            return res.json({ payments: [], page, pages: 0 });
        }
    }
    if (req.query.year) query.year = req.query.year;
    if (req.query.month) query.month = req.query.month;
    if (req.query.status) query.status = req.query.status;

    const count = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
        .populate('student', 'name studentId')
        .populate('course', 'courseName')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ payments, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Create new payment (Manual)
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = asyncHandler(async (req, res) => {
    const { studentId, courseId, amount, paymentType, month, year, status } = req.body;

    let student = await Student.findOne({ studentId: studentId });
    if (!student) {
        try {
            student = await Student.findById(studentId);
        } catch (e) { }
    }

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const receiptNo = `REC-${Date.now()}`;

    const payment = await Payment.create({
        student: student._id,
        course: courseId,
        amount,
        paymentType,
        month,
        year,
        status,
        receiptNo,
        receivedBy: req.user.name
    });

    res.status(201).json(payment);
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private/Admin
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
        amount: amount * 100, // Amount in smallest currency unit
        currency,
        receipt,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500);
        throw new Error(error.message);
    }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private/Admin
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentData } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', 'QJy7ikqacKxrVn8Evijmi2Qz') // Using key_secret
        .update(body.toString())
        .digest('hex');

    console.log('--- RAZORPAY DEBUG ---');
    console.log('Received Signature:', razorpay_signature);
    console.log('Expected Signature:', expectedSignature);
    console.log('Order ID:', razorpay_order_id);
    console.log('Payment ID:', razorpay_payment_id);

    if (expectedSignature === razorpay_signature) {
        // Signature verified, save payment to DB
        // paymentData contains the student/course/etc info we need to save
        const { studentId, courseId, amount, paymentType, month, year } = paymentData;

        // Lookup student again just to be safe
        let student = await Student.findOne({ studentId: studentId });
        if (!student) {
            try { student = await Student.findById(studentId); } catch (e) { }
        }

        if (!student) {
            res.status(404);
            throw new Error('Student not found during verification');
        }

        const receiptNo = `REC-${Date.now()}`;

        const payment = await Payment.create({
            student: student._id,
            course: courseId,
            amount,
            paymentType,
            month,
            year,
            status: 'Paid', // Confirmed via Razorpay
            receiptNo,
            receivedBy: 'Online (Razorpay)'
        });

        res.json({ message: 'Payment verified successfully', payment });
    } else {
        res.status(400);
        throw new Error('Invalid signature');
    }
});

// @desc    Get stats for payment dashboard (Global)
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = asyncHandler(async (req, res) => {
    const stats = await Payment.aggregate([
        {
            $group: {
                _id: null,
                totalCollected: {
                    $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] }
                },
                totalDueRecorded: {
                    $sum: { $cond: [{ $eq: ["$status", "Due"] }, "$amount", 0] }
                },
                count: { $sum: 1 }
            }
        }
    ]);

    res.json(stats[0] || { totalCollected: 0, totalDueRecorded: 0, count: 0 });
});

// @desc    Get stats for a specific student
// @route   GET /api/payments/stats/:studentId
// @access  Private/Admin
const getStudentStats = asyncHandler(async (req, res) => {
    // resolve student ID first
    let student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
        try { student = await Student.findById(req.params.studentId); } catch (e) { }
    }

    if (!student) {
        return res.json({ totalPaid: 0, totalDue: 0, count: 0 }); // Or 404
    }

    const stats = await Payment.aggregate([
        { $match: { student: student._id } },
        {
            $group: {
                _id: null,
                totalPaid: {
                    $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] }
                },
                totalDue: {
                    $sum: { $cond: [{ $eq: ["$status", "Due"] }, "$amount", 0] }
                },
                count: { $sum: 1 }
            }
        }
    ]);

    res.json(stats[0] || { totalPaid: 0, totalDue: 0, count: 0 });
});


module.exports = {
    getPayments,
    createPayment,
    getPaymentStats,
    getStudentStats,
    createOrder,
    verifyPayment
};
