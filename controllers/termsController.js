const Terms = require("../models/termModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ✅ Create or Update Terms & Conditions
exports.createOrUpdateTerms = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return errorResponse(res, 400, "Title and content are required.");
        }

        // Check for existing active terms
        const existing = await Terms.findOne();

        let terms;
        if (existing) {
            existing.content = content;
            await existing.save();
            terms = existing;
        } else {
            terms = await Terms.create({ content });
        }

        return successResponse(
            res,
            existing ? "Terms & Conditions updated successfully" : "Terms & Conditions created successfully",
            terms
        );
    } catch (error) {
        next(error);
    }
};

// ✅ Get active Terms
exports.getTerm = async (req, res, next) => {
    try {
        const terms = await Terms.findOne();
        if (!terms) return errorResponse(res, 404, "No Terms & Conditions found");

        return successResponse(res, "Terms & Conditions fetched successfully", terms);
    } catch (error) {
        next(error);
    }
};