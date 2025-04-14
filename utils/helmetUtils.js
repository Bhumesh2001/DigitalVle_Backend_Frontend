exports.helmetContent = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            (req, res) => `'nonce-${res.locals.nonce}'`,
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'", // Needed for Bootstrap or inline styles
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
        ],
        styleSrcElem: [
            "'self'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
        ],
        fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com"
        ],
        imgSrc: [
            "'self'",
            "data:",
            "https://cdn.jsdelivr.net",
            "https://res.cloudinary.com",
            "https://via.placeholder.com"
        ],
        mediaSrc: [
            "'self'",
            "https://res.cloudinary.com"
        ],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"]
    }
};
