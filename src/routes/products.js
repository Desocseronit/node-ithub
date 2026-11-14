const express = require('express');
const router = express.Router();
const { validateRequest, schemas } = require("./../middleware/validate");
const upload = require('./../middleware/upload');
const Product = require('./../models/Product');

router.get('/', validateRequest(schemas.productQuery, 'query'), (req, res) => {
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Список продуктов с фильтрацией и пагинацией'
     #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1, description: 'Номер страницы' }
     #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10, description: 'Количество на странице' }
     #swagger.parameters['category'] = { in: 'query', type: 'string', description: 'Фильтр по категории' }
     #swagger.parameters['search'] = { in: 'query', type: 'string', description: 'Поиск по имени/описанию' }
     #swagger.parameters['minPrice'] = { in: 'query', type: 'number', description: 'Минимальная цена' }
     #swagger.parameters['maxPrice'] = { in: 'query', type: 'number', description: 'Максимальная цена' }
     #swagger.parameters['sort'] = { in: 'query', type: 'string', enum: ['price', 'name', 'stock', 'createdAt'], default: 'createdAt', description: 'Поле сортировки' }
     #swagger.parameters['order'] = { in: 'query', type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Направление сортировки' }
  */

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
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Получить продукт по ID'
     #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID продукта' }
  */

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
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Создать продукт'
     #swagger.consumes = ['multipart/form-data']
     #swagger.parameters['name'] = { in: 'formData', type: 'string', required: true, minLength: 2, maxLength: 100, description: 'Название', example: 'Ноутбук' }
     #swagger.parameters['price'] = { in: 'formData', type: 'number', required: true, minimum: 1, description: 'Цена', example: 999.99 }
     #swagger.parameters['category'] = { in: 'formData', type: 'string', required: true, enum: ['electronics', 'clothing', 'food', 'other'], description: 'Категория', example: 'electronics' }
     #swagger.parameters['stock'] = { in: 'formData', type: 'integer', minimum: 0, default: 0, description: 'Остаток на складе', example: 10 }
     #swagger.parameters['description'] = { in: 'formData', type: 'string', maxLength: 500, description: 'Описание', example: 'Мощный ноутбук' }
     #swagger.parameters['image'] = { in: 'formData', type: 'file', description: 'Файл изображения' }
  */

  let productData = Object.assign(req.body, { imageUrl: req.file ? `/uploads/products/${req.file.filename}` : null });
  let product = new Product(productData);
  res.status(201).json(product.info);
});

router.post('/:id/image', upload.single('image'), validateRequest(schemas.idParam, 'params'), (req, res, next) => {
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Загрузить изображение продукта'
     #swagger.consumes = ['multipart/form-data']
     #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID продукта' }
     #swagger.parameters['image'] = { in: 'formData', type: 'file', required: true, description: 'Файл изображения' }
  */

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
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Полностью обновить продукт'
     #swagger.consumes = ['multipart/form-data']
     #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID продукта' }
     #swagger.parameters['name'] = { in: 'formData', type: 'string', required: true, minLength: 2, maxLength: 100, description: 'Название', example: 'Ноутбук' }
     #swagger.parameters['price'] = { in: 'formData', type: 'number', required: true, minimum: 1, description: 'Цена', example: 999.99 }
     #swagger.parameters['category'] = { in: 'formData', type: 'string', required: true, enum: ['electronics', 'clothing', 'food', 'other'], description: 'Категория', example: 'electronics' }
     #swagger.parameters['stock'] = { in: 'formData', type: 'integer', minimum: 0, default: 0, description: 'Остаток на складе', example: 10 }
     #swagger.parameters['description'] = { in: 'formData', type: 'string', maxLength: 500, description: 'Описание', example: 'Мощный ноутбук' }
     #swagger.parameters['image'] = { in: 'formData', type: 'file', description: 'Файл изображения' }
  */

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
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Частично обновить продукт'
     #swagger.consumes = ['multipart/form-data']
     #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID продукта' }
     #swagger.parameters['name'] = { in: 'formData', type: 'string', minLength: 2, maxLength: 100, description: 'Название', example: 'Ноутбук' }
     #swagger.parameters['price'] = { in: 'formData', type: 'number', minimum: 1, description: 'Цена', example: 999.99 }
     #swagger.parameters['category'] = { in: 'formData', type: 'string', enum: ['electronics', 'clothing', 'food', 'other'], description: 'Категория', example: 'electronics' }
     #swagger.parameters['stock'] = { in: 'formData', type: 'integer', minimum: 0, description: 'Остаток на складе', example: 10 }
     #swagger.parameters['description'] = { in: 'formData', type: 'string', maxLength: 500, description: 'Описание', example: 'Мощный ноутбук' }
     #swagger.parameters['image'] = { in: 'formData', type: 'file', description: 'Файл изображения' }
  */

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
  /* #swagger.tags = ['Products']
     #swagger.summary = 'Удалить продукт'
     #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID продукта' }
  */

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