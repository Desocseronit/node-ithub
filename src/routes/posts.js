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

// GET /api/posts — Список с фильтрацией и пагинацией
router.get('/', validateRequest(schemas.postQuery, 'query'), async (req, res, next) => {
    /* #swagger.tags = ['Posts']
       #swagger.summary = 'Список постов с фильтрацией и пагинацией'
       #swagger.parameters['page'] = { in: 'query', type: 'integer', default: 1, description: 'Номер страницы' }
       #swagger.parameters['limit'] = { in: 'query', type: 'integer', default: 10, description: 'Количество на странице' }
       #swagger.parameters['search'] = { in: 'query', type: 'string', description: 'Поиск по заголовку' }
       #swagger.parameters['published'] = { in: 'query', type: 'boolean', description: 'Фильтр по статусу публикации' }
       #swagger.parameters['authorId'] = { in: 'query', type: 'integer', description: 'Фильтр по ID автора' }
       #swagger.parameters['sort'] = { in: 'query', type: 'string', enum: ['title', 'createdAt'], default: 'createdAt', description: 'Поле сортировки' }
       #swagger.parameters['order'] = { in: 'query', type: 'string', enum: ['asc', 'desc'], default: 'desc', description: 'Направление сортировки' }
    */

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
                    author: true,
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

// GET /api/posts/:id — Пост с автором и тегами
router.get('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    /* #swagger.tags = ['Posts']
       #swagger.summary = 'Получить пост по ID'
       #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID поста' }
    */

    try {
        const id = Number(req.params.id);

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: true,
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

// POST /api/posts — Создать пост
router.post('/', validateRequest(schemas.postCreate, 'body'), async (req, res, next) => {
    /* #swagger.tags = ['Posts']
       #swagger.summary = 'Создать пост'
       #swagger.requestBody = {
         required: true,
         content: {
           "application/json": {
             schema: {
               type: "object",
               properties: {
                 title: { type: "string", minLength: 2, maxLength: 50, example: "Мой первый пост" },
                 content: { type: "string", minLength: 2, maxLength: 500, example: "Текст поста..." },
                 published: { type: "boolean", default: false },
                 authorId: { type: "integer", minimum: 1, example: 1 },
                 tags: {
                   type: "array",
                   items: { type: "string" },
                   example: ["nodejs", "prisma"]
                 }
               },
               required: ["title", "authorId"]
             }
           }
         }
       }
    */

    try {
        const { title, content, published, authorId, tags } = req.body;

        const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
        if (!authorExists) {
            return next(createError(404, `Author with id ${authorId} not found`));
        }

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
                author: true,
                tags: true,
            },
        });

        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/posts/:id — Обновить пост
router.patch(
    '/:id',
    validateRequest({ params: schemas.idParam, body: schemas.postPatch }),
    async (req, res, next) => {
        /* #swagger.tags = ['Posts']
           #swagger.summary = 'Обновить пост'
           #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID поста' }
           #swagger.requestBody = {
             required: true,
             content: {
               "application/json": {
                 schema: {
                   type: "object",
                   properties: {
                     title: { type: "string", minLength: 2, maxLength: 50, example: "Обновленный заголовок" },
                     content: { type: "string", minLength: 2, maxLength: 500, example: "Новый текст..." },
                     published: { type: "boolean" },
                     authorId: { type: "integer", minimum: 1 },
                     tags: {
                       type: "array",
                       items: { type: "string" },
                       example: ["backend", "express"]
                     }
                   }
                 }
               }
             }
           }
        */

        try {
            const id = Number(req.params.id);
            const { title, content, published, authorId, tags } = req.body;

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
                    author: true,
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

// DELETE /api/posts/:id — Удалить пост
router.delete('/:id', validateRequest(schemas.idParam, 'params'), async (req, res, next) => {
    /* #swagger.tags = ['Posts']
       #swagger.summary = 'Удалить пост'
       #swagger.parameters['id'] = { in: 'path', type: 'integer', required: true, description: 'ID поста' }
    */

    try {
        const id = Number(req.params.id);

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
});

module.exports = router;