const express = require("express");
const cors = require("cors");
const path = require('path');
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

require('./utils/subscription.util');
require('./utils/coupon.util');
require('./utils/story.util');
require('./utils/upload.util');
const connectDB = require("./config/db.config");
const errorHandler = require("./middlewares/error.middleware");
const { helmetContent } = require('./utils/helmet.util');

dotenv.config();
const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5001",
    credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));

// Secure CSP with all allowed sources
app.use(helmet.contentSecurityPolicy(helmetContent));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Default Route
app.get('/', (req, res) => res.send('🎉 Welcome to the Independent Digital Vle!'));

// Routes
app.use('/admin', require('./routes/page.route'));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/articles", require("./routes/article.route"));
app.use('/api/stories', require('./routes/story.route'));
app.use('/api/like-comments', require("./routes/like.comment.route"));
app.use("/api/contact", require("./routes/contact.route"));
app.use('/api/admin', require('./routes/admin.route'));
app.use("/api/videos", require("./routes/video.route"));
app.use("/api/categories", require("./routes/category.route"));
app.use('/api/banners', require('./routes/banner.route'));
app.use("/api/coupons", require("./routes/coupon.route"));
app.use('/api/subscription-plans', require('./routes/subscription.plan.route'));
app.use("/api/subscriptions", require("./routes/subscription.route"));
app.use('/api/dashboard', require('./routes/dashboard.route'));
app.use("/api/settings", require("./routes/setting.route"));
app.use('/api/admin-articles', require('./routes/admin.article.route'));
app.use('/api/admin-stories', require('./routes/admin.story.route'));
app.use("/api/admin-users", require("./routes/admin.user.route"));
app.use('/api/payments', require('./routes/payment.route'));
app.use("/api/terms", require('./routes/terms.route'));
app.use('/api/upload', require('./routes/upload.route'));

// 404 Not Found Handler
app.use((req, res, next) => res.render("404"));

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
