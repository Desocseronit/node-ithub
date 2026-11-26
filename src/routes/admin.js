const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// PATCH /admin/users/:id/role
router.patch('/users/:id/role', authenticate, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be USER, MODERATOR, or ADMIN' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
