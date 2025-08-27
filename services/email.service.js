const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// ✅ Set API Key once
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email asynchronously using SendGrid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
    try {
        const msg = {
            to,
            from: {
                name: "Independent Digital Vle",
                email: process.env.FROM_EMAIL, // ✅ Must be verified in SendGrid
            },
            subject,
            html,
        };

        await sgMail.send(msg);
        // console.log(`✅ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("❌ Email sending failed:", error.response?.body || error.message);
        return false;
    }
};

module.exports = sendEmail;
