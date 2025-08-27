const Contact = require("../models/contact.model");
const { successResponse, errorResponse } = require("../utils/response.util");

// ✅ Submit Contact Form with optimized validation
exports.submitContactForm = async (req, res, next) => {
    try {
        const requiredFields = ["name", "email", "phone", "city", "district", "state", "country", "pincode", "message"];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length) {
            return errorResponse(res, 400, "Missing required fields");
        }

        const { email } = req.body;

        // ✅ Check for existing contact
        const existingContact = await Contact.findOne({ email });
        if (existingContact) {
            return successResponse(
                res,
                "You have already submitted a contact form. We will get back to you soon!",
                existingContact
            );
        }

        // ✅ Create new contact
        const contact = await Contact.create(req.body);

        return successResponse(res, "Contact form submitted successfully", contact);
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
