const { cloudinary } = require("../config/cloudinary.config");
const fs = require("fs");

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) {
        throw new Error("Public ID is required");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });

    if (result.result !== "ok") {
        throw new Error(`Failed to delete image (Public ID: ${publicId})`);
    }
};

const uploadToCloudinary = async (filePath, folder = "uploads", resourceType = "auto") => {
    return new Promise((resolve, reject) => {
        const cleanup = () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        };

        cloudinary.uploader.upload(
            filePath,
            {
                folder,
                resource_type: resourceType,
                chunk_size: 10 * 1024 * 1024, // 10MB chunks
                timeout: 600000, // 10 minutes
            },
            (error, result) => {
                cleanup();
                if (error) return reject(error);
                resolve(result);
            }
        );
    });
};

module.exports = {
    deleteFromCloudinary,
    uploadToCloudinary,
};