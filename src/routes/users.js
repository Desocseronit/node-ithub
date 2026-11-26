const express = require('express');
const prisma = require('../config/prisma');
const { validateRequest, schemas } = require('../middleware/validate');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};

// Поля пользователя без пароля
const userSafeSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    createdAt: true,
};

// GET /api/users — Список с пагинацией (только MODERATOR и ADMIN)
router.get(
    '/',
    authenticate,
    authorizeRoles('MODERATOR', 'ADMIN'),
    validateRequest(schemas.userQuery, 'query'),
    async (req, res, next) => {
        /* #swagger.tags = ['Users']
           #swagger.summary = 'Список пользователей с пагинацией (MODERATOR, ADMIN)'
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
                    select: userSafeSelect,
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
    }
);

// GET /api/users/:id — Пользователь с постами
router.get('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Получить пользователя по ID (с постами)'
    */
    try {
        const id = Number(req.params.id);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                ...userSafeSelect,
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

// POST /api/users — Создать пользователя (только ADMIN)
router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(schemas.userCreate, 'body'),
    async (req, res, next) => {
        try {
            const user = await prisma.user.create({
                data: req.body,
                select: userSafeSelect,
            });

            res.status(201).json(user);
        } catch (err) {
            if (err.code === 'P2002') {
                return next(createError(409, 'User with this email already exists'));
            }
            next(err);
        }
    }
);

// PATCH /api/users/:id — Обновить пользователя (только ADMIN)
router.patch(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest({ params: schemas.idParam, body: schemas.userPatch }),
    async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            const user = await prisma.user.update({
                where: { id },
                data: req.body,
                select: userSafeSelect,
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

// DELETE /api/users/:id — Удалить пользователя (только ADMIN)
router.delete(
    '/:id',
    authenticate,
    authorizeRoles('ADMIN'),
    validateRequest(schemas.idParam, 'params'),
    async (req, res, next) => {
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
    }
);

module.exports = router;
