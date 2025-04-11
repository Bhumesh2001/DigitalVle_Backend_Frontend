const Setting = require('../models/settingModel');
const configCache = new Map();

const getSetting = async (key) => {
    if (configCache.has(key)) return configCache.get(key);

    const setting = await Setting.findOne({ key });
    if (setting) {
        configCache.set(key, setting.value);
        return setting.value;
    }

    return null;
};

const getMultipleSettings = async (...keys) => {
    const result = {};
    for (const key of keys) {
        result[key] = await getSetting(key);
    }
    return result;
};

const refreshSetting = async (key) => {
    const setting = await Setting.findOne({ key });
    if (setting) {
        configCache.set(key, setting.value);
        return setting.value;
    }
    configCache.delete(key);
    return null;
};

module.exports = {
    getSetting,
    getMultipleSettings,
    refreshSetting,
};
