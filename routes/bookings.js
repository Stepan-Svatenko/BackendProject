const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/access.middleware');
const {
    listBookings,
    getBooking,
    createBooking,
    updateBooking,
    removeBooking,
} = require('../controllers/bookings.controller');

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, listBookings);
router.get('/:id', authMiddleware, getBooking);
router.put('/:id', authMiddleware, requireAdmin, updateBooking);
router.delete('/:id', authMiddleware, requireAdmin, removeBooking);

module.exports = router;
