const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/access.middleware');
const {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    removeEvent,
} = require('../controllers/events.controller');

const router = express.Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authMiddleware, requireAdmin, createEvent);
router.put('/:id', authMiddleware, requireAdmin, updateEvent);
router.delete('/:id', authMiddleware, requireAdmin, removeEvent);

module.exports = router;
