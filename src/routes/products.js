const express = require('express');
const router = express.Router();
const { validateRequest, schemas } = require("./../middleware/validate");
const upload = require('./../middleware/upload');
const Product = require('./../models/Product');

router.get('/',
    validateRequest(schemas.productQuery, 'query'),
    (req, res) => {
        const { page, limit, category, search, minPrice, maxPrice, sort, order } = req.query;

        let items = Object.values(Product.allInstances);
        if (category) items = items.filter(p => p.category?.toLowerCase() === category);
        if (search) items = items.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.description ?? '').toLowerCase().includes(search));
        if (minPrice !== undefined) items = items.filter(p => p.price >= minPrice);
        if (maxPrice !== undefined) items = items.filter(p => p.price <= maxPrice);

        let dir = order === 'asc' ? 1 : -1;
        items.sort((a, b) => (a[sort] > b[sort] ? dir : a[sort] < b[sort] ? -dir : 0));

        let total = items.length;
        let totalPages = Math.ceil(total / limit) || 1;
        let skip = (page - 1) * limit;
        let data = items.slice(skip, skip + limit);

        res.json({
            data,
            meta: {
                total, page, limit, totalPages,
                hasNext: page < totalPages, hasPrev: page > 1
            },
        });
    }
);

router.get('/:id',
    validateRequest(schemas.idParam, 'params'),
    (req, res, next) => {
        const product = Product.allInstances[req.params.id];
        if (!product) {
            const err = new Error(`Product with id ${req.params.id} not found`);
            err.statusCode = 404;
            err.isOperational = true;
            return next(err);
        }
        res.json(product.info);
    }
);

router.post('/',
    upload.single('image'),
    validateRequest(schemas.productCreate),
    (req, res, next) => {
        let productData = Object.assign(req.body, { imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null })
        new Product(productData);
        res.status(201).json(productData);
    }
)

router.post('/:id/image',
    upload.single('image'),
    validateRequest(schemas.idParam, 'params'),
    (req, res, next) => {
        const product = Product.allInstances[req.params.id];
        if (!product) {
            const err = new Error(`Product with id ${req.params.id} not found`);
            err.statusCode = 404;
            err.isOperational = true;
            return next(err);
        }
        if (!req.file) {
            const err = new Error('Image file is required (field "image")');
            err.statusCode = 400;
            err.isOperational = true;
            return next(err);
        }
        product.imageUrl = `/uploads/products/${req.file.filename}`;
        res.json(product.info);
    }
)


module.exports = router;
