const { cloudinary } = require("../config/cloudinary");

/**
 * ✅ Optimized Image Upload to Cloudinary
 * @param {string} filePath - Temporary file path of the uploaded file
 * @param {string} folder - Folder name in Cloudinary (default: 'uploads')
 * @returns {Promise<Object>} - Uploaded file details (URL, public_id)
 */
const uploadImageOnCloudinary = async (filePath, folder = "uploads") => {
    if (!filePath) throw new Error("File path is required");

    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "image",
        use_filename: true, // Keep original filename for better management
        unique_filename: false, // Avoid duplicate uploads with different names
        overwrite: true, // Replace existing files if re-uploaded
        transformation: [{ quality: "auto", fetch_format: "auto" }], // Optimize format & quality
    });

    return { url: result.secure_url, public_id: result.public_id };
};

/**
 * ✅ Upload Video to Cloudinary (Returns secure_url & public_id)
 * @param {string} filePath - Temporary file path of the uploaded video
 * @param {string} folder - Folder name in Cloudinary (default: 'videos')
 * @returns {Promise<Object>} - { secure_url, public_id }
 */
const uploadVideoOnCloudinary = async (filePath, folder = "videos") => {
    if (!filePath) throw new Error("File path is required");

    const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: "video",
        chunk_size: 6000000, // 6MB chunks for large video uploads
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        eager: [
            { quality: "auto", fetch_format: "auto" }, // Optimize quality & format
        ],
        eager_async: true,
    });

    return { url: result.secure_url, public_id: result.public_id };
};

/**
 * Deletes an image from Cloudinary. Throws an error if deletion fails.
 * @param {string} publicId - The public ID of the image to delete.
 * @param {string} [resourceType="image"] - Optional: Resource type ("image", "video", "raw").
 * @throws {Error} If deletion fails (invalid publicId, Cloudinary error, etc.).
 */
const deleteImageFromCloudinary = async (publicId, resourceType = "image") => {
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

module.exports = {
    deleteImageFromCloudinary,
    uploadImageOnCloudinary,
    uploadVideoOnCloudinary
};