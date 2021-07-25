'use strict';

const jwt = require('jsonwebtoken');
const { token } = require('morgan');
const jwtAuth = require('../lib/jwtAuth');
const Usuario = require('../models/User');
const emailTransportConfigure = require('../lib/emailTransportConfigure');
const mailer = require('../lib/mailer');
const nodemailer = require('nodemailer');

class LoginController {
	/**
	 * POST /auth/signup
	 */
	post(req, res, next) {
		const { username, email, password } = req.body;
		Usuario.hashPassword(password).then((hash) => {
			Usuario.create({
				username: username,
				email: email,
				password: hash,
			})
				.then(() => {
					res.json('USER REGISTERED');
				})
				.catch((error) => {
					if (error) {
						res.status(400).json({ error: error });
						console.log(error);
					}
				});
		});
	}

	/**
	 * POST /auth/signin
	 */
	async postJWT(req, res, next) {
		try {
			const { username, password } = req.body;

			const usuario = await Usuario.findOne({ username });

			if (!usuario || !(await usuario.comparePassword(password))) {
				const error = new Error('invalid credentials');
				error.status = 401;
				next(error);
				return;
			}

			jwt.sign(
				{ _id: usuario._id },
				process.env.JWT_SECRET,
				{ expiresIn: '2h' },
				(err, jwtToken) => {
					if (err) {
						next(err);
						return;
					}
					res.json({ token: jwtToken });
					console.log(`tokenBack ${jwtToken}`);
				}
			);
		} catch (err) {
			next(err);
		}
	}

	async forgotPassword(req, res, next) {
		const { email } = req.body;
		const message = 'check your email link to reset your password';

		const authPath = process.env.LOCAL_HOST_WEB_NEW_PASSWORD;

		let verificationLinks;
		let emailStatus = 'ok';

		try {
			const user = await Usuario.findOne({ email });
			const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
				expiresIn: '2h',
			});
			verificationLinks = `${authPath}/new-password/id=${user._id}/token=${token}`;
			const message = await mailer(email, 'Forgot Password', verificationLinks);
			const transporter = await emailTransportConfigure();

			transporter.sendMail(message, (err, info) => {
				if (err) {
					console.log('Error occurred. ' + err.message);
					return process.exit(1);
				}
				console.log('Message sent: %s', info.messageId);
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
			});
		} catch (error) {
			console.log(error);

			return res.status(400).json({ message: 'Somenthing goes wrong !' });
		}

		res.json({ message, info: emailStatus, test: verificationLinks });
	}

	async createNewPassword(req, res, next) {
		const { newPassword, _id } = req.body;

		if (!(newPassword && _id)) {
			res.status(400).json({ message: 'requires fields' });
		}

		try {
			const user = await Usuario.findOne({ _id });

			const newPasswordCription = await Usuario.hashPassword(newPassword);

			await Usuario.updateOne(user, { password: newPasswordCription });
		} catch (error) {
			return res.status(400).json({ message: 'Somenthing goes wrong !' });
		}
		res.json({ message: 'update ' });
	}
}

module.exports = new LoginController();
