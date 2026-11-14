const notFound = (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    next(err);
};

const handlePrismaError = (err) => {
    switch (err.code) {
        case 'P2002': {
            const fields = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
            return {
                statusCode: 409,
                message: `Unique constraint failed${fields}`,
            };
        }
        case 'P2025':
            return {
                statusCode: 404,
                message: err.meta?.cause || 'Record not found',
            };
        case 'P2003':
            return {
                statusCode: 400,
                message: 'Foreign key constraint failed (related record does not exist or is in use)',
            };
        case 'P2014':
            return {
                statusCode: 400,
                message: 'Relation violation between records',
            };
        default:
            return {
                statusCode: 400,
                message: `Database error (${err.code})`,
            };
    }
};

const errorHandler = (err, req, res, next) => {
    const isPrismaKnown = err.name === 'PrismaClientKnownRequestError';
    const isPrismaValidation = err.name === 'PrismaClientValidationError';

    if (!err.isOperational && !isPrismaKnown && !isPrismaValidation) {
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

    if (isPrismaKnown) {
        const prismaErr = handlePrismaError(err);
        return res.status(prismaErr.statusCode).json({
            error: prismaErr.message,
            code: err.code,
        });
    }

    if (isPrismaValidation) {
        return res.status(400).json({
            error: 'Database query validation failed',
            ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
        });
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
