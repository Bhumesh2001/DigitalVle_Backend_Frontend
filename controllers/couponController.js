const Coupon = require("../models/couponModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ✅ Create a new Coupon
exports.createCoupon = async (req, res, next) => {
    try {
        const { code, discount, type, expiryDate } = req.body;

        if (!code || !discount || !type || !expiryDate) {
            return errorResponse(res, 400, "All fields are required");
        }

        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) return errorResponse(res, 400, "Coupon code already exists");

        const coupon = await Coupon.create({ code, discount, type, expiryDate });

        successResponse(res, "Coupon created successfully", coupon);
    } catch (error) {
        next(error);
    }
};

// ✅ Get all Coupons
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        successResponse(res, "Coupons retrieved successfully", coupons);
    } catch (error) {
        next(error);
    }
};

// ✅ Get a single Coupon by ID
exports.getCouponById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        if (!coupon) return errorResponse(res, 404, "Coupon not found");

        successResponse(res, "Coupon retrieved successfully", coupon);
    } catch (error) {
        next(error);
    }
};

// ✅ Update a Coupon
exports.updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, discount, type, expiryDate, status } = req.body;

        const coupon = await Coupon.findById(id);
        if (!coupon) return errorResponse(res, 404, "Coupon not found");

        coupon.code = code || coupon.code;
        coupon.discount = discount || coupon.discount;
        coupon.type = type || coupon.type;
        coupon.expiryDate = expiryDate || coupon.expiryDate;
        coupon.status = status || coupon.status;

        await coupon.save();
        successResponse(res, "Coupon updated successfully", coupon);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete a Coupon
exports.deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) return errorResponse(res, 404, "Coupon not found");

        await coupon.deleteOne();
        successResponse(res, "Coupon deleted successfully");
    } catch (error) {
        next(error);
    }
};

// ✅ Fetch rondom Coupon
exports.getRandomCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.aggregate([
            { $match: { status: "active", expiryDate: { $gte: new Date() } } },
            { $sample: { size: 1 } },
            {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }
            }
        ]);

        if (!coupon.length) return errorResponse(res, 404, "No active coupons found!");

        successResponse(res, "Random coupon fetched successfully!", coupon[0]);
    } catch (error) {
        next(error);
    }
};
