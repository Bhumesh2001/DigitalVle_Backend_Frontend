const { body } = require("express-validator");
const mongoose = require("mongoose");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.createAdminValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.loginAdminValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.createOrUpdateCategoryValidator = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isString().withMessage("Category name must be a string")
        .trim(),

    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Invalid status value"),
];

exports.createOrUpdateVideoValidator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .trim(),

    body("description")
        .optional()
        .isString().withMessage("Description must be a string")
        .trim(),

    body("category")
        .notEmpty().withMessage("Category is required")
        .custom(value => isValidObjectId(value)).withMessage("Invalid category ID"),

    body("tags")
        .optional()
        .isArray().withMessage("Tags must be an array")
        .custom((arr) => arr.every(tag => typeof tag === "string"))
        .withMessage("Each tag must be a string")
];

exports.createOrUpdateBannerValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim(),

    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be either active or inactive")
];

exports.createOrUpdateCouponValidator = [
    body("code")
        .notEmpty().withMessage("Coupon code is required")
        .isString().withMessage("Coupon code must be a string")
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage("Coupon code must be between 3 and 20 characters"),

    body("discount")
        .notEmpty().withMessage("Discount is required")
        .isFloat({ min: 0 }).withMessage("Discount must be a positive number"),

    body("type")
        .notEmpty().withMessage("Coupon type is required")
        .isIn(["percentage", "fixed"]).withMessage("Type must be either percentage or fixed"),

    body("expiryDate")
        .notEmpty().withMessage("Expiry date is required")
        .isISO8601().withMessage("Expiry date must be a valid date"),

    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be either active or inactive")
];

exports.createOrUpdateSubscriptionPlanValidator = [
    body("name")
        .notEmpty().withMessage("Plan name is required")
        .isString().withMessage("Plan name must be a string")
        .trim(),

    body("price")
        .notEmpty().withMessage("Price is required")
        .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

    body("duration")
        .notEmpty().withMessage("Duration is required")
        .isIn(["monthly", "quarterly", "yearly"]).withMessage("Duration must be monthly, quarterly, or yearly"),

    body("status")
        .optional()
        .isIn(["active", "inactive"]).withMessage("Status must be either active or inactive"),

    body("features")
        .optional()
        .isArray().withMessage("Features must be an array of strings")
        .custom((features) => {
            if (!features.every(f => typeof f === "string")) {
                throw new Error("All features must be strings");
            }
            return true;
        })
];

exports.createOrUpdateArticleValidator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .trim(),

    body("description")
        .notEmpty().withMessage("Description is required")
        .isString().withMessage("Description must be a string")
        .trim(),
];

exports.createOrUpdateStoryValidator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .trim(),

    body("caption")
        .optional()
        .isString().withMessage("Caption must be a string")
        .trim(),
];

exports.createUserValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    body("mobileNumber")
        .optional()
        .matches(/^\d{10}$/).withMessage("Mobile number must be 10 digits")
];

exports.updateUserValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("mobileNumber")
        .optional()
        .matches(/^\d{10}$/).withMessage("Mobile number must be 10 digits")
];

exports.UpdateUserValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim(),

    body("mobileNumber")
        .optional()
        .matches(/^\d{10}$/).withMessage("Mobile number must be 10 digits")
];

exports.createOrUpdateTermsValidator = [
    body("content")
        .notEmpty().withMessage("Content is required")
        .isString().withMessage("Content must be a string")
        .trim()
];

exports.createContactValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .isLength({ max: 254 }).withMessage("Email cannot exceed 254 characters")
        .normalizeEmail(),

    body("phone")
        .optional()
        .matches(/^\+?[\d\s\-]{10,15}$/).withMessage("Invalid phone number")
        .isLength({ max: 15 }).withMessage("Phone number cannot exceed 15 characters"),

    body("city")
        .optional()
        .isString().withMessage("City must be a string")
        .isLength({ max: 50 }).withMessage("City cannot exceed 50 characters")
        .trim(),

    body("district")
        .optional()
        .isString().withMessage("District must be a string")
        .isLength({ max: 50 }).withMessage("District cannot exceed 50 characters")
        .trim(),

    body("state")
        .optional()
        .isString().withMessage("State must be a string")
        .isLength({ max: 50 }).withMessage("State cannot exceed 50 characters")
        .trim(),

    body("country")
        .optional()
        .isString().withMessage("Country must be a string")
        .isLength({ max: 50 }).withMessage("Country cannot exceed 50 characters")
        .trim(),

    body("pincode")
        .optional()
        .matches(/^\d{6}$/).withMessage("Invalid pincode"),

    body("message")
        .optional()
        .isString().withMessage("Message must be a string")
        .isLength({ max: 1000 }).withMessage("Message cannot exceed 1000 characters")
        .trim()
];

exports.createSubscriptionValidator = [
    body("userId")
        .notEmpty().withMessage("User ID is required")
        .custom(isValidObjectId).withMessage("Invalid User ID"),

    body("planId")
        .notEmpty().withMessage("Plan ID is required")
        .custom(isValidObjectId).withMessage("Invalid Plan ID"),

    body("razorpayPaymentId")
        .optional()
        .isString().withMessage("Razorpay Payment ID must be a string"),

    body("razorpayOrderId")
        .optional()
        .isString().withMessage("Razorpay Order ID must be a string"),

    body("category")
        .optional()
        .custom(isValidObjectId).withMessage("Invalid Category ID"),

    body("isAllCategories")
        .optional()
        .isBoolean().withMessage("isAllCategories must be a boolean"),
];

exports.createPaymentValidator = [
    body("categoryId")
        .optional({ nullable: true })
        .custom(isValidObjectId).withMessage("Invalid Category ID"),
];
