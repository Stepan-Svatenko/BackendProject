const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const swaggerUi = require('swagger-ui-express');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/api-users');
const eventsRouter = require('./routes/events');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/errorHandler');

const swaggerDocument = require('./swagger/openapi.json');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', authMiddleware, usersRouter);
app.use('/events', eventsRouter);
app.use('/bookings', bookingsRouter);
app.get('/swagger.json', (req, res) => res.json(swaggerDocument));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

app.use(errorHandler);

module.exports = app;
