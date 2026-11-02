const express = require('express');
const router = express.Router();
const { validateRequest, schemas } = require("./../middleware/validate");
const upload = require('./../middleware/upload');
const Product = require('./../models/Product');

router.get('/', validateRequest(schemas.productQuery, 'query'), (req, res) => {
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1 }
     #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10 }
     #swagger.parameters['category'] = { in: 'query', type: 'string' }
     #swagger.parameters['search'] = { in: 'query', type: 'string' }
     #swagger.parameters['minPrice'] = { in: 'query', type: 'number' }
     #swagger.parameters['maxPrice'] = { in: 'query', type: 'number' }
     #swagger.parameters['sort'] = { in: 'query', type: 'string', enum: ['price', 'name', 'stock', 'createdAt'], default: 'createdAt' }
     #swagger.parameters['order'] = { in: 'query', type: 'string', enum: ['asc', 'desc'], default: 'desc' } */
  
  const { page, limit, category, search, minPrice, maxPrice, sort, order } = req.query;
  let items = Object.values(Product.allInstances);
  
  if (category) items = items.filter(p => p.category?.toLowerCase() === category);
  if (search) items = items.filter(p => p.name.toLowerCase().includes(search) || (p.description ?? '').toLowerCase().includes(search));
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
    meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  });
});

router.get('/:id', validateRequest(schemas.idParam, 'params'), (req, res, next) => {
  // #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true }
  
  const product = Product.allInstances[req.params.id];
  if (!product) {
    const err = new Error(`Product with id ${req.params.id} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    return next(err);
  }
  res.json(product.info);
});

router.post('/', upload.single('image'), validateRequest(schemas.productCreate), (req, res, next) => {
  /* #swagger.requestBody = {
       required: true,
       content: {
         "multipart/form-data": {
           schema: {
             type: "object",
             properties: {
               name: { type: "string", minLength: 2, maxLength: 100 },
               price: { type: "number", minimum: 1 },
               category: { type: "string", enum: ['electronics', 'clothing', 'food', 'other'] },
               stock: { type: "integer", minimum: 0, default: 0 },
               description: { type: "string", maxLength: 500 },
               image: { type: "string", format: "binary" }
             },
             required: ["name", "price", "category"]
           }
         }
       }
     } */
  
  let productData = Object.assign(req.body, { imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null });
  let product = new Product(productData);
  res.status(201).json(product.info);
});

router.post('/:id/image', upload.single('image'), validateRequest(schemas.idParam, 'params'), (req, res, next) => {
  /* #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true }
     #swagger.requestBody = {
       required: true,
       content: {
         "multipart/form-data": {
           schema: {
             type: "object",
             properties: {
               image: { type: "string", format: "binary" }
             },
             required: ["image"]
           }
         }
       }
     } */
  
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
});

router.put('/:id', upload.single('image'), validateRequest(schemas.idParam, 'params'), validateRequest(schemas.productCreate), (req, res, next) => {
  /* #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true }
     #swagger.requestBody = {
       required: true,
       content: {
         "multipart/form-data": {
           schema: {
             type: "object",
             properties: {
               name: { type: "string", minLength: 2, maxLength: 100 },
               price: { type: "number", minimum: 1 },
               category: { type: "string", enum: ['electronics', 'clothing', 'food', 'other'] },
               stock: { type: "integer", minimum: 0, default: 0 },
               description: { type: "string", maxLength: 500 },
               image: { type: "string", format: "binary" }
             },
             required: ["name", "price", "category"]
           }
         }
       }
     } */
  
  let product = Product.allInstances[req.params.id];
  if (!product) {
    const err = new Error(`Product with id ${req.params.id} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    return next(err);
  }
  let newProductData = Object.assign(req.body, { imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null });
  Object.assign(product, newProductData);
  res.json(product.info);
});

router.patch('/:id', upload.single('image'), validateRequest(schemas.idParam, 'params'), validateRequest(schemas.patchProduct), (req, res, next) => {
  /* #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true }
     #swagger.requestBody = {
       content: {
         "multipart/form-data": {
           schema: {
             type: "object",
             properties: {
               name: { type: "string", minLength: 2, maxLength: 100 },
               price: { type: "number", minimum: 1 },
               category: { type: "string", enum: ['electronics', 'clothing', 'food', 'other'] },
               stock: { type: "integer", minimum: 0 },
               description: { type: "string", maxLength: 500 },
               image: { type: "string", format: "binary" }
             }
           }
         }
       }
     } */
  
  let product = Product.allInstances[req.params.id];
  if (!product) {
    const err = new Error(`Product with id ${req.params.id} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    return next(err);
  }
  let newProductData = req.body;
  if (req.file) {
    newProductData = Object.assign(req.body, { imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null });
  }
  Object.assign(product, newProductData);
  res.json(product.info);
});

router.delete('/:id', validateRequest(schemas.idParam, 'params'), (req, res, next) => {
  // #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true }
  
  const product = Product.allInstances[req.params.id];
  if (!product) {
    const err = new Error(`Product with id ${req.params.id} not found`);
    err.statusCode = 404;
    err.isOperational = true;
    return next(err);
  }
  delete Product.allInstances[req.params.id];
  res.json({ ok: true });
});

module.exports = router;
