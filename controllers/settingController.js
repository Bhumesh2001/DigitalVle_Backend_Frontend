const Setting = require("../models/settingModel");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// 🔹 Create or Update Setting
exports.upsertSetting = async (req, res, next) => {
    try {
        const settings = Array.isArray(req.body) ? req.body : [req.body];

        const upserts = await Promise.all(settings.map(async ({ key, value }) => {
            if (!key) return null;
            return Setting.findOneAndUpdate(
                { key },
                { value },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }));

        successResponse(res, "Setting(s) saved successfully", upserts.filter(Boolean));
    } catch (err) {
        next(err);
    }
};

// 🔹 Get All Settings
exports.getAllSettings = async (req, res, next) => {
    try {
        const settings = await Setting.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).sort({ key: 1 });
        successResponse(res, "Settings fetched successfully", settings);
    } catch (err) {
        next(err);
    }
};

// 🔹 Get Setting by Key
exports.getSettingByKey = async (req, res, next) => {
    try {
        const { key } = req.params;
        const setting = await Setting.findOne({ key }, { createdAt: 0, updatedAt: 0, __v: 0 });
        if (!setting) return errorResponse(res, 404, "Setting not found");
        successResponse(res, "Setting fetched successfully", setting);
    } catch (err) {
        next(err);
    }
};
