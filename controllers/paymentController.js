const Payment = require('../models/paymentModel');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { uploadImageOnCloudinary } = require('../utils/cloudinaryUtils');

exports.createPayment = async (req, res, next) => {
    try {
        const { categoryId = null } = req.body;

        if (!req.files || !req.files.imageUrl) return errorResponse(res, 400, 'No file uploaded');
        const uploadedData = await uploadImageOnCloudinary(req.files.imageUrl.tempFilePath, "VlePayments");

        const payment = await Payment.create({
            userId: req.user.id,
            categoryId,
            imageUrl: uploadedData.url,
            publicId: uploadedData.public_id
        });

        return successResponse(res, 'Payment submitted successfully', payment);
    } catch (error) {
        next(error);
    }
};

exports.getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email mobileNumber status')
            .populate('categoryId', 'name imageUrl status');
        return successResponse(res, 'Payments fetched successfully', payments);
    } catch (error) {
        next(error);
    }
};

exports.getPaymentsByUser = async (req, res, next) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .populate('categoryId', 'name imageUrl status')
            .populate('userId', 'name email mobileNumber status');

        if (!payments.length) {
            return errorResponse(res, 'No payments found for this user', 404);
        }

        return successResponse(res, 'User payment history fetched successfully', payments);
    } catch (error) {
        next(error);
    }
};
