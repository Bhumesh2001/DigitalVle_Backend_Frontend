const nodemailer = require("nodemailer");

// ✅ Configure transporter only once (better performance)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", // Default to Gmail if not set
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_PORT == 465, // Use TLS for 465
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Send an email asynchronously
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Independent Digital Vle" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        // console.log(`✅ Email sent to ${to}: ${info.response}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        return false;
    }
};

module.exports = sendEmail;
