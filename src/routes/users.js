const express = require('express');
const prisma = require('../config/prisma');
const { validateRequest, schemas } = require('../middleware/validate');

const router = express.Router();

const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};

// GET /api/users — Список с пагинацией
router.get('/', validateRequest(schemas.userQuery, 'query'), async (req, res, next) => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Список пользователей с пагинацией'
       #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1, description: 'Номер страницы' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10, description: 'Количество на странице' }
       #swagger.parameters['sort'] = { in: 'query', type: 'string', enum: ['name', 'createdAt'], default: 'createdAt', description: 'Поле сортировки' }
       #swagger.parameters['order'] = { in: 'query', type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Направление сортировки' }
    */

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { [sort]: order },
            }),
            prisma.user.count(),
        ]);

        res.json({
            data: users,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/users/:id — Пользователь с постами
router.get('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Получить пользователя по ID (с постами)'
       #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID пользователя' }
    */

    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return next(createError(404, `User with id ${id} not found`));
        }

        res.json(user);
    } catch (err) {
        next(err);
    }
});

// POST /api/users — Создать пользователя
router.post('/', validateRequest(schemas.userCreate, 'body'), async (req, res, next) => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Создать пользователя'
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: {
               type: "object",
               properties: {
                 email: { type: "string", format: "email", example: "user@example.com", description: "Email пользователя" },
                 name: { type: "string", minLength: 2, maxLength: 100, example: "Иван Иванов", description: "Имя пользователя" },
                 role: { type: "string", enum: ["USER", "ADMIN"], default: "USER", example: "USER", description: "Роль пользователя" }
               },
               required: ["email", "name"]
             }
           }
         }
       }
    */

    try {
        const user = await prisma.user.create({
            data: req.body,
        });

        res.status(201).json(user);
    } catch (err) {
        if (err.code === 'P2002') {
            return next(createError(409, 'User with this email already exists'));
        }
        next(err);
    }
});

// PATCH /api/users/:id — Обновить пользователя
router.patch(
    '/:id',
    validateRequest({ params: schemas.idParam, body: schemas.userPatch }),
    async (req, res, next) => {
        /* #swagger.tags = ['Users']
           #swagger.summary = 'Обновить пользователя'
           #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID пользователя' }
           #swagger.requestBody = {
             required: true,
             content: {
               "application/json": {
                 schema: {
                   type: "object",
                   properties: {
                     email: { type: "string", format: "email", example: "new@example.com", description: "Новый email" },
                     name: { type: "string", minLength: 2, maxLength: 100, example: "Петр Петров", description: "Новое имя" },
                     role: { type: "string", enum: ["USER", "ADMIN"], example: "USER", description: "Новая роль" }
                   }
                 }
               }
             }
           }
        */

        try {
            const id = Number(req.params.id);

            const user = await prisma.user.update({
                where: { id },
                data: req.body,
            });

            res.json(user);
        } catch (err) {
            if (err.code === 'P2025') {
                return next(createError(404, `User with id ${req.params.id} not found`));
            }
            if (err.code === 'P2002') {
                return next(createError(409, 'User with this email already exists'));
            }
            next(err);
        }
    }
);

// DELETE /api/users/:id — Удалить пользователя
router.delete('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Удалить пользователя'
       #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID пользователя' }
    */

    try {
        const id = Number(req.params.id);

        await prisma.user.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (err) {
        if (err.code === 'P2025') {
            return next(createError(404, `User with id ${req.params.id} not found`));
        }
        if (err.code === 'P2003') {
            return next(createError(400, 'Cannot delete user who has existing posts'));
        }
        next(err);
    }
});

module.exports = router;