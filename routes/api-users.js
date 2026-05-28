const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requireSelfOrAdmin } = require('../middleware/access.middleware');
const {
    listUsers,
    getUser,
    createUser,
    updateUser,
    removeUser,
} = require('../controllers/users.controller');

const router = express.Router();

router.get('/', authMiddleware, listUsers);
router.get('/:id', authMiddleware, requireSelfOrAdmin, getUser);
router.post('/', authMiddleware, requireAdmin, createUser);
router.put('/:id', authMiddleware, requireSelfOrAdmin, updateUser);
router.delete('/:id', authMiddleware, requireSelfOrAdmin, removeUser);

module.exports = router;
