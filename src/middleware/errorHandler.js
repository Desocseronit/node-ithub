const notFound = (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    next(err);
};

const errorHandler = (err, req, res, next) => {
    
    if (!err.isOperational) {
        console.error('UNEXPECTED ERROR:', err);
    }

    
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.details.map(d => ({
                message: d.message,
                path: d.path,
            })),
        });
    }
    
    if (err.isMulter) {
        return res.status(400).json({
            error: `Upload error: ${err.message}`,
            code: err.code,
        });
    }

    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    
    if (err.isOperational) {
        return res.status(err.statusCode || 500).json({
            error: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message,
    });
};

module.exports = { notFound, errorHandler };