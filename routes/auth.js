const router = require('express').Router();
const { login, logout, refresh, register } = require('../controllers/auth.controller');

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/register', register);

module.exports = router;
