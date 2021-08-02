var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const jwtAuth = require('./lib/jwtAuth');
const loginController = require('./controllers/loginController');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mailsRouter = require('./routes/mail');
var advertsRouter = require('./routes/api/advertisements');

var app = express();

require('./models/connectMongoose');
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/email', mailsRouter);

app.use(cors());

/************************************* CHAT *******************************************/
const http = require('http');
const socket = require('socket.io');

const server = http.createServer(app);

const io = socket(server, {
	cors: {
		origin: process.env.REACT_APP_API_BASE_URL,
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

const NEW_CHAT_MESSAGE_EVENT = 'NEW_CHAT_MESSAGE_EVENT';

io.on('connection', (socket) => {
	console.log(`${socket.id} connected`);

	// Join a conversation
	const { roomId } = socket.handshake.query;
	socket.join(roomId);

	// Listen for new messages
	socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
		io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
	});

	// Leave the room if the user closes the socket
	socket.on('disconnect', () => {
		socket.leave(roomId);
	});
});

/************************************* FIN CHAT *****************************************/

/** Rutas del API
 *
 */

app.use('/apiv1/users', require('./routes/users'));
app.post('/apiv1/auth/signin', loginController.postJWT);
app.post('/apiv1/auth/signup', loginController.post);
app.put('/apiv1/auth/forgot-password', loginController.forgotPassword);
app.put('/apiv1/auth/new-password', jwtAuth, loginController.createNewPassword);
app.post('/apiv1/advertisements', jwtAuth, advertsRouter);
app.use('/apiv1/advertisements', advertsRouter);
app.use('/apiv1/tags', require('./routes/api/tags'));
app.use('/apiv1/conversations', require('./routes/conversations'));
app.use('/apiv1/messages', require('./routes/messages'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	if (err.array) {
		const errorInfo = err.array({ onlyFirstError: true })[0];
		err.message = `Not valid - ${errorInfo.param} ${errorInfo.msg}`;
		err.status = 422;
	}
	res.status(err.status || 500);
	// si es una petición al API respondo JSON...
	if (isAPIRequest(req)) {
		res.json({ error: err.message });
		return;
	}

	// set locals, only providing error in development

	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page

	res.render('error');
});

function isAPIRequest(req) {
	return req.originalUrl.indexOf('/apiv1/') === 0;
}

module.exports = app;
