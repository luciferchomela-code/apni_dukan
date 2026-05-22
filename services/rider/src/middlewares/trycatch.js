const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.statusCode || 500).json({  // ✅ statusCode not code
            success: false,
            message: error.message,
        });
    }
};

export default asyncHandler;