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
    return`Your subscription is expiring on ${sub.endDate.toDateString()}.Renew now to continue access!`
};

const expiryReminderTemplate = (user, subscription) => {
    return`
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

module.exports = { 
    registrationEmailTemplate, 
    getOtpEmailTemplate,
    subscriptionReminderTemplate, 
    expiryReminderTemplate,
};
