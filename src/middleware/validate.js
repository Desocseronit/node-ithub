const Joi = require('joi');
const fs = require('fs');

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

            if (src === 'query') {
                Object.assign(req.query, value);
            } else {
                req[src] = value;
            }
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

    // GET /products/:id || /users/:id  || /posts/:id
    idParam: Joi.object({
        id: Joi.number().integer().min(0).required(),
    }),


    //PATCH /products/:id
    patchProduct: Joi.object({
        name: Joi.string().trim().min(2).max(100),
        price: Joi.number().min(1),
        category: Joi.string().trim().valid('electronics', 'clothing', 'food', 'other'),
        stock: Joi.number().integer().min(0),
        description: Joi.string().allow(null, '').max(500)
    }),

    //GET /users
    userQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('name', 'createdAt').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    // POST /users
    userCreate: Joi.object({
        email: Joi.string().email().trim().lowercase().required(),
        name: Joi.string().trim().min(2).max(100).required(),
        role: Joi.string().trim().valid('USER', 'ADMIN').default('USER'),
    }),

    // PATCH /users/:id
    userPatch: Joi.object({
        email: Joi.string().email().trim().lowercase(),
        name: Joi.string().trim().min(2).max(100),
        role: Joi.string().trim().valid('USER', 'ADMIN'),
    }).min(1),

    // GET /posts
    postQuery: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().trim().max(200),
        published: Joi.boolean(),
        authorId: Joi.number().integer().positive(),
        sort: Joi.string().valid('title', 'createdAt').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
    }),

    // POST /posts
    postCreate: Joi.object({
        title: Joi.string().trim().min(2).max(50).required(),
        content: Joi.string().trim().min(2).max(500).allow(null, ''),
        published: Joi.boolean().default(false),
        authorId: Joi.number().integer().positive().required(),
        tags: Joi.array()
            .items(Joi.string().trim().min(1).max(50))
            .unique()
            .default([]),
    }),

    // PATCH /posts/:id
    postPatch: Joi.object({
        title: Joi.string().trim().min(2).max(50),
        content: Joi.string().trim().min(2).max(500).allow(null, ''),
        published: Joi.boolean(),
        authorId: Joi.number().integer().positive(),
        tags: Joi.array()
            .items(Joi.string().trim().min(1).max(50))
            .unique(),
    }).min(1),
};

module.exports = { validateRequest, schemas };