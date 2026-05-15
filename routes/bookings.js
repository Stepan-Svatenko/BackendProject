const express = require('express');
const { listBookings, getBooking, createBooking, updateBooking, removeBooking } = require('../controllers/bookings.controller');

const router = express.Router();

router.get('/', listBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', removeBooking);

module.exports = router;
