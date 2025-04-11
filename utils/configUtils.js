const { getMultipleSettings, refreshSetting } = require('./settingUtils');

class ConfigManager {
    constructor() {
        this.config = {};
        this.loaded = false;
    };

    async load() {
        if (this.loaded) return;

        const settings = await getMultipleSettings(
            'PORT',
            'MONGO_URI',
            'JWT_SECRET',
            'SMTP_EMAIL',
            'SMTP_PASSWORD',
            'SMTP_HOST',
            'SMTP_PORT',
            'CLIENT_ID',
            'ClIENT_SECRET',
            'CALLBACK_URL',
            'CLOUDINARY_CLOUD_NAME',
            'CLOUDINARY_API_KEY',
            'CLOUDINARY_API_SECRET',
            'RAZORPAY_KEY',
            'RAZORPAY_SECRET',
            'NODE_ENV'
        );

        this.config = settings;
        this.loaded = true;
    };

    get(key) {
        return this.config[key] || null;
    };

    async refresh(key) {
        const updated = await refreshSetting(key);
        this.config[key] = updated;
        return updated;
    };
};

module.exports = new ConfigManager();
