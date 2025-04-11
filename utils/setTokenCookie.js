const setTokenCookie = (res, token, tokenName) => {
    res.cookie(tokenName, token, {
        httpOnly: true,  // Prevents client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "Strict", // Protects against CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // Token expires in 7 days
    });
};

module.exports = setTokenCookie;
