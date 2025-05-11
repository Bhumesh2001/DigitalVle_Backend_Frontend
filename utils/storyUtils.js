const cron = require("node-cron");
const Story = require("../models/storyModel");
const AdminStory = require("../models/adminStoryModel");

cron.schedule("*/5 * * * *", async () => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const timestamp = new Date().toISOString();

    try {
        const [userResult, adminResult] = await Promise.all([
            Story.deleteMany({ createdAt: { $lt: cutoff } }),
            AdminStory.deleteMany({ createdAt: { $lt: cutoff } }),
        ]);

        // console.log(`[${timestamp}] [Cron] ✅ Deleted ${userResult.deletedCount} from Story, ${adminResult.deletedCount} from AdminStory.`);
    } catch (err) {
        console.error(`[${timestamp}] [Cron] ❌ Error during deletion: ${err.message}`);
    }
});