'use strict';

const jwt = require('jsonwebtoken');
const jwtAuth = require('../lib/jwtAuth');
const Usuario = require('../models/Usuario');

class LoginController {
	/**
	 * POST /auth/signup
	 */
	async post(req, res, next) {
		try {
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
						}
					});
			});
		} catch (err) {
			next(err);
		}
	}
	/**
	 * POST /auth/signin
	 */
	async postJWT(req, res, next) {
		try {
			const { username, password } = req.body;

			// buscar el usuario en la BD
			const usuario = await Usuario.findOne({ username });

			// si no lo encontramos --> error
			// si no coincide la clave --> error
			if (!usuario || !(await usuario.comparePassword(password))) {
				const error = new Error('invalid credentials');
				error.status = 401;
				next(error);
				return;
			}

			// si el usuario existe y la clave coincide

			/** crear un token JWT (firmado)
			 * para generar el tokes se usa metodo sign pasa el usuario, la firma de decodificacion , el tiempo de valides y por ultimo un callback primero el error y luego devuelve un jason con el token
			 * */
			jwt.sign(
				{ _id: usuario._id },
				process.env.JWT_SECRET,
				{ expiresIn: '2h' },
				(err, jwtToken) => {
					if (err) {
						next(err);
						return;
					}
					// devolveselo al cliente
					res.json({ token: jwtToken });
				}
			);
		} catch (err) {
			next(err);
		}
	}

	async forgotPassword(req, res, next) {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: 'se requiere un email' });
		}
		const message = 'revise su email link para restablecer su contraseña';
		let verificacionLinks;
		let emailStatus = 'ok';

		try {
			const userEmail = await Usuario.findOne({ email });
			const token = jwt.sign(
				{ _id: usuario._id },
				process.env.JWT_SECRET,
				{ expiresIn: '2h' },
				(err, jwtToken) => {
					if (err) {
						next(err);
						return;
					}
				}
			);
			verificacionLinks = `https://localhost:3000/apiv1/auth/new-password/${token}`;
			user.resetToken = token;
		} catch (error) {
			res.status(400).json({ message: 'no encontrado usuario en la BBDD' });
		}

		//TODO: sendEmail

		try {
		} catch (error) {
			emailStatus = error;
			return res.status(400).json({ message: 'algo ha salido mal' });
		}

		try {
			await Usuario.save(userEmail);
		} catch (error) {
			res.status(400).json({ message: 'algo ha salido mal' });
		}

		res.json({ message, info: emailStatus });
	}

	async createNewPassword(req, res, next) {
		const { newPassword } = req.body;
		const resetToken = req.headers;

		if (!(resetToken && newPassword)) {
			res.status(400).json({ message: 'se requiere de todos campos' });
		}

		try {
		} catch (error) {
			return res.status(400).json({ message: 'algo ha salido mal' });
		}
	}
}

module.exports = new LoginController();
