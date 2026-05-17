const express = require('express');
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
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', removeEvent);

module.exports = router;
