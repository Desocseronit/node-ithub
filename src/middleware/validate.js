const Joi = require('joi');
const fs = require('fs')

const validateRequest = (schemas, source = 'body') => {
    let map = schemas && (schemas.body || schemas.query || schemas.params)
        ? schemas
        : { [source]: schemas };

    return (req, res, next) => {
        for (let [src, schema] of Object.entries(map)) {
            if (!schema) continue;

            let { error, value } = schema.validate(req[src], {
                abortEarly: false,
                stripUnknown: true,
                convert: true,
            });

            if (error) {
                if (req.file && req.file.path) {
                    fs.unlink(req.file.path, () => { });
                }
                const err = new Error('Validation failed');
                err.statusCode = 400;
                err.isOperational = true;
                err.isJoi = true;
                err.details = error.details.map(d => ({
                    message: d.message,
                    path: d.path,
                }));
                return next(err);
            }

            req[src] = value;
        }
        next();
    };
};

const schemas = {
    // POST /products
    productCreate: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        price: Joi.number().min(1).required(),
        category: Joi.string().trim().valid('electronics', 'clothing', 'food', 'other').required(),
        stock: Joi.number().integer().min(0).default(0),
        description: Joi.string().allow(null, '').max(500).default(null)
    }),

    // GET /products
    productQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        category: Joi.string().trim().lowercase(),
        search: Joi.string().trim().lowercase().max(200),
        minPrice: Joi.number().min(0),
        maxPrice: Joi.number().min(0),
        sort: Joi.string().valid('price', 'name', 'stock', 'createdAt').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
    }).custom((v, helpers) => {
        if (v.minPrice !== undefined && v.maxPrice !== undefined && v.minPrice > v.maxPrice) {
            return helpers.error('any.invalid');  // → 400
        }
        return v;
    }),

    // GET /products/:id
    idParam: Joi.object({
        id: Joi.number().integer().min(0).required(),
    }),


    //PATCH /:id
    patchProduct: Joi.object({
        name: Joi.string().trim().min(2).max(100),
        price: Joi.number().min(1),
        category: Joi.string().trim().valid('electronics', 'clothing', 'food', 'other'),
        stock: Joi.number().integer().min(0),
        description: Joi.string().allow(null, '').max(500)
    })
};

module.exports = { validateRequest, schemas };