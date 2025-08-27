exports.successResponse = (res, message, data = {}) => {
    res.status(200).json({
        success: true,
        message,
        data,
    });
};

exports.errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        message,
    });
};
