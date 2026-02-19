const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paymentType: {
        type: String, // e.g., 'Monthly Fee', 'Admission Fee', 'Exam Fee'
        required: true,
    },
    month: {
        type: String, // e.g., 'February'
    },
    year: {
        type: Number, // e.g., 2019
    },
    status: {
        type: String,
        enum: ['Paid', 'Due'],
        default: 'Paid',
    },
    receiptNo: {
        type: String,
        unique: true,
    },
    receivedBy: {
        type: String, // Admin username/ID
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
