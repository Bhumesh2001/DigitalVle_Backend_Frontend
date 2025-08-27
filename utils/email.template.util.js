const registrationEmailTemplate = (name) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2C3E50;">Welcome to Our Platform, ${name}! 🎉</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with us. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best Regards,</p>
        <strong>Independent Digital Vle</strong>
    </div>
`;

const getOtpEmailTemplate = (otp) => {
    return `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="max-width: 500px; background-color: #ffffff; padding: 20px; margin: auto; border-radius: 10px;">
                <img src="https://cdn-icons-png.flaticon.com/512/3884/3884856.png" alt="Logo" width="80">
                <h2 style="color: #333;">Verify Your Account</h2>
                <p style="color: #555;">Use the following One-Time Password (OTP) to verify your account. This OTP is valid for <strong>5 minutes</strong>.</p>
                <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
                <p>If you didn’t request this, you can safely ignore this email.</p>
                <a href="#" style="background-color: #007bff; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Now</a>
                <p style="color: #777; font-size: 14px;">Need help? <a href="#" style="color: #007bff;">Contact Support</a></p>
            </div>
        </div>
    `;
};

const subscriptionReminderTemplate = (sub) => {
    return `Your subscription is expiring on ${sub.endDate.toDateString()}.Renew now to continue access!`
};

const expiryReminderTemplate = (user, subscription) => {
    return `
        <h3>Hello ${user.name},</h3>
        <p>Your subscription has expired on <strong>${subscription.endDate.toDateString()}</strong>.</p>
        <p>Please renew your subscription to continue enjoying our services.</p>
        <a href="https://yourwebsite.com/renew-subscription" style="padding: 10px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Renew Now</a>
        <p>Thank you for being with us!</p>
        <br>
        <p>Best Regards,</p>
        <p>Your Company Name</p>
    `
};

const sendEmailOtp = (name, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Verify Your Email - Independent Digital VLE</title>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
            .email-header { background-color: #4f46e5; padding: 20px; text-align: center; color: white; }
            .email-header h1 { margin: 0; font-size: 24px; }
            .email-body { padding: 30px; color: #333; }
            .email-body h2 { margin-top: 0; color: #111827; }
            .otp-box { margin: 20px 0; background-color: #f9fafb; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 4px; font-weight: bold; border-radius: 6px; color: #4f46e5; border: 1px dashed #c7d2fe; }
            .email-footer { margin-top: 30px; font-size: 12px; text-align: center; color: #6b7280; padding: 20px; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Independent Digital VLE</h1>
            </div>
            <div class="email-body">
                <h2>Verify Your Email Address</h2>
                <p>Hello, ${name}</p>
                <p>Thank you for registering with <strong>Independent Digital VLE</strong>!</p>
                <p>Please use the following One-Time Password (OTP) to verify your email address:</p>

                <div class="otp-box">
                    ${otp}
                </div>

                <p>This OTP is valid for the next <strong>5 minutes</strong>.</p>
                <p>If you did not request this, you can safely ignore this email.</p>

                <p>Best Regards,<br>Independent Digital VLE Team</p>
            </div>
            <div class="email-footer">
                &copy; 2025 Independent Digital VLE. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    registrationEmailTemplate,
    getOtpEmailTemplate,
    subscriptionReminderTemplate,
    expiryReminderTemplate,
    sendEmailOtp,
};
