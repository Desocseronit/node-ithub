const express = require('express');
const prisma = require('../config/prisma');
const { validateRequest, schemas } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createError = (statusCode, message) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    return err;
};

const authorSafeSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
};

// GET /api/posts — Список с фильтрацией и пагинацией (доступно всем)
router.get('/', validateRequest(schemas.postQuery, 'query'), async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';
        const { search, published, authorId } = req.query;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.title = {
                contains: search,
            };
        }

        if (published !== undefined) {
            where.published = published === true || published === 'true';
        }

        if (authorId !== undefined) {
            where.authorId = Number(authorId);
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    author: { select: authorSafeSelect },
                    tags: true,
                },
            }),
            prisma.post.count({ where }),
        ]);

        res.json({
            data: posts,
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

// GET /api/posts/:id — Пост с автором и тегами (доступно всем)
router.get('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: { select: authorSafeSelect },
                tags: true,
            },
        });

        if (!post) {
            return next(createError(404, `Post with id ${id} not found`));
        }

        res.json(post);
    } catch (err) {
        next(err);
    }
});

// POST /api/posts — Создать пост (USER, MODERATOR, ADMIN)
router.post(
    '/',
    authenticate,
    (req, res, next) => {
        // Подставляем authorId из JWT, чтобы прошла схема валидации postCreate
        if (req.body && !req.body.authorId) {
            req.body.authorId = req.user.id;
        }
        next();
    },
    validateRequest(schemas.postCreate, 'body'),
    async (req, res, next) => {
        try {
            const { title, content, published, tags } = req.body;
            const authorId = req.user.id;

            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    published,
                    authorId,
                    ...(tags && tags.length > 0 && {
                        tags: {
                            connectOrCreate: tags.map((tagName) => ({
                                where: { name: tagName },
                                create: { name: tagName },
                            })),
                        },
                    }),
                },
                include: {
                    author: { select: authorSafeSelect },
                    tags: true,
                },
            });

            res.status(201).json(post);
        } catch (err) {
            next(err);
        }
    }
);

// PATCH /api/posts/:id — Обновить пост (USER: только свой; MODERATOR/ADMIN: любой)
router.patch(
    '/:id',
    authenticate,
    validateRequest({ params: schemas.idParam, body: schemas.postPatch }),
    async (req, res, next) => {
        try {
            const id = Number(req.params.id);
            const { title, content, published, authorId, tags } = req.body;

            // Проверяем существование поста и права доступа (ownership / RBAC)
            const existingPost = await prisma.post.findUnique({ where: { id } });
            if (!existingPost) {
                return next(createError(404, `Post with id ${id} not found`));
            }

            const isOwner = existingPost.authorId === req.user.id;
            const isPrivileged = ['MODERATOR', 'ADMIN'].includes(req.user.role);

            if (!isOwner && !isPrivileged) {
                return next(createError(403, 'Forbidden: you can only edit your own posts'));
            }

            if (authorId !== undefined) {
                const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
                if (!authorExists) {
                    return next(createError(404, `Author with id ${authorId} not found`));
                }
            }

            const post = await prisma.post.update({
                where: { id },
                data: {
                    ...(title !== undefined && { title }),
                    ...(content !== undefined && { content }),
                    ...(published !== undefined && { published }),
                    ...(authorId !== undefined && { authorId }),
                    ...(tags !== undefined && {
                        tags: {
                            set: [],
                            connectOrCreate: tags.map((tagName) => ({
                                where: { name: tagName },
                                create: { name: tagName },
                            })),
                        },
                    }),
                },
                include: {
                    author: { select: authorSafeSelect },
                    tags: true,
                },
            });

            res.json(post);
        } catch (err) {
            if (err.code === 'P2025') {
                return next(createError(404, `Post with id ${req.params.id} not found`));
            }
            next(err);
        }
    }
);

// DELETE /api/posts/:id — Удалить пост (USER: только свой; MODERATOR/ADMIN: любой)
router.delete(
    '/:id',
    authenticate,
    validateRequest(schemas.idParam, 'params'),
    async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            // Проверяем существование поста и права доступа (ownership / RBAC)
            const existingPost = await prisma.post.findUnique({ where: { id } });
            if (!existingPost) {
                return next(createError(404, `Post with id ${id} not found`));
            }

            const isOwner = existingPost.authorId === req.user.id;
            const isPrivileged = ['MODERATOR', 'ADMIN'].includes(req.user.role);

            if (!isOwner && !isPrivileged) {
                return next(createError(403, 'Forbidden: you can only delete your own posts'));
            }

            await prisma.post.delete({
                where: { id },
            });

            res.status(204).send();
        } catch (err) {
            if (err.code === 'P2025') {
                return next(createError(404, `Post with id ${req.params.id} not found`));
            }
            next(err);
        }
    }
);

module.exports = router;
