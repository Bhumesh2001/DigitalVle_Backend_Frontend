const cron = require("node-cron");
const Story = require("../models/storyModel");
const AdminStory = require("../models/adminStoryModel");
const { deleteImageFromCloudinary } = require("../utils/cloudinaryUtils");

cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const timestamp = new Date().toISOString();

    try {
        // 1. Find expired stories
        const [expiredUserStories, expiredAdminStories] = await Promise.all([
            Story.find({ createdAt: { $lt: cutoff } }),
            AdminStory.find({ createdAt: { $lt: cutoff } })
        ]);

        // 2. Delete images from Cloudinary
        const allStories = [...expiredUserStories, ...expiredAdminStories];
        await Promise.all(
            allStories.map(async (story) => {
                try {
                    if (story.publicId) {
                        await deleteImageFromCloudinary(story.publicId);
                    }
                } catch (err) {
                    console.error(`[${timestamp}] ❌ Failed to delete image ${story.publicId}: ${err.message}`);
                }
            })
        );

        // 3. Delete expired stories from DB
        const [userResult, adminResult] = await Promise.all([
            Story.deleteMany({ createdAt: { $lt: cutoff } }),
            AdminStory.deleteMany({ createdAt: { $lt: cutoff } })
        ]);

        // console.log(`[${timestamp}] ✅ Deleted ${allStories.length} images and ${userResult.deletedCount + adminResult.deletedCount} stories.`);
    } catch (err) {
        console.error(`[${timestamp}] ❌ Error during cron job: ${err.message}`);
    }
});
