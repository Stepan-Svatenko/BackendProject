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
app.use('/events', authMiddleware, eventsRouter);
app.use('/bookings', authMiddleware, bookingsRouter);
app.get('/swagger.json', (req, res) => res.json(swaggerDocument));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
