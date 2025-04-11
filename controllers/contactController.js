const Contact = require("../models/contactModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ✅ Submit Contact Form
exports.submitContactForm = async (req, res, next) => {
    try {
        const contactData = req.body;
        const contact = await Contact.create(contactData);
        successResponse(res, "Contact form submitted successfully", contact);
    } catch (error) {
        next(error);
    }
};

// ✅ Get All Contact Form Submissions
exports.getAllContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        successResponse(res, "Fetched all contact form submissions", contacts);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Contact Form Submission
exports.getContactById = async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return errorResponse(res, 404, "Contact form not found");
        successResponse(res, "Fetched contact form details", contact);
    } catch (error) {
        next(error);
    }
};

// ✅ Delete Contact Form Submission
exports.deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return errorResponse(res, 404, "Contact form not found");
        successResponse(res, "Contact deleted successfully");
    } catch (error) {
        next(error);
    }
};
