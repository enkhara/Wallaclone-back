var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Advertisement = require('../models/Advertisement');
const jwtAuth = require('../lib/jwtAuth');

/* GET /users listing. */
router.get('/', async function (req, res, next) {
	//res.send('respond with a resource');
	try {
		const username = req.query.username;
		const email = req.query.email;

		const limit = parseInt(req.query.limit); //lo convierte a num porque todo en req es string
		const skip = parseInt(req.query.skip); // para paginar skip
		const fields = req.query.fields;
		const sort = req.query.sort;

		const filtro = {};
		if (username) {
			filtro.username = new RegExp('^' + username, 'i');
		}
		if (email) {
			filtro.email = new RegExp('^' + email, 'i');
		}

		const resultado = await User.lista(filtro, limit, skip, fields, sort);
		res.json(resultado);
	} catch (err) {
		next(err);
	}
});

/**
 * GET /users/:id (Obtener un usuario por id)
 */
router.get('/:userId', async (req, res, next) => {
	try {
		const _userId = req.params.id;

		const user = await User.findOne({ _id: _userId });

		if (!user) {
			return res.status(404).json({ error: 'not found' });
		}
		res.json({ result: user });
	} catch (err) {
		next(err);
	}
});

/**
 * PUT /users/:id (body)
 * Actualizar un usuario, en el body le pasamos lo que queremos actualizar
 * TODO: se podrá actualizar cualquiera de los datos, incluida la contraseña
 */
router.put('/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;
		const userData = req.body; // TODO (ESTA FUNCIÓN NO PODRÁ ACTUALIZAR LOS FAVORITOS, SOLO EL RESTO DE CAMPOS)

		const userActualizado = await User.findOneAndUpdate(
			{ _id: _id },
			userData,
			{
				new: true,
				useFindAndModify: false,
			}
		);

		// usamos {new:true} para que nos devuelva el usuario actualizado, para evitar el error
		// de deprecated añade useFindAndModify:false

		if (!userActualizado) {
			res.status(404).json({ error: 'not found' });
			return;
		}

		res.json({ result: userActualizado });
	} catch (error) {
		next(error);
	}
});

/**
 * PUT /users/addfavourite/:id (body)
 * Actualizar los ads favoritos de un usuario dado su id,
 * en el body le pasamos el id del anuncio a añadir
 * tendrá que añadir el id del anauncio (si no existe) al array de ids de anuncios
 * que ya tuviera marcados como favoritos anteriormente
 */
router.put('/addfavourite/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;
		const userData = req.body; // formato x-www-form-urlencoded

		console.log('favorito a actualizar', userData.ads_favs);
		if (userData.ads_favs !== undefined) {
			const user = await User.findOne({ _id: _id });
			// Buscamos si el anuncio que queremos insertar no existe
			if (user.ads_favs.indexOf(userData.ads_favs) === -1) {
				user.ads_favs.push(userData.ads_favs);
				userData.ads_favs = user.ads_favs;
				console.log('Nuevo anuncio favorito añadido al usuario');
			} else if (user.ads_favs.indexOf(userData.ads_favs) > -1) {
				console.log(userData.ads_favs + ' ya existe como anuncio favorito');
				userData.ads_favs = user.ads_favs; // los copiamos como estaban pq sino actualiza el array al que le paso
			}
		}

		console.log('UserData', userData);
		const userActualizado = await User.findOneAndUpdate(
			{ _id: _id },
			userData,
			{
				new: true,
				useFindAndModify: false,
			}
		);

		// usamos {new:true} para que nos devuelva el usuario actualizado, para evitar el error
		// de deprecated añade useFindAndModify:false

		if (!userActualizado) {
			res.status(404).json({ error: 'not found' });
			return;
		}

		res.json({ result: userActualizado });
	} catch (error) {
		next(error);
	}
});

/**
 * PUT /users/deletefavourite/:id (id de usuario)
 * Elimina un id de anuncio del array de ads_favs,
 * en el body le pasamos el id del anuncio a eliminar
 */
router.put('/deletefavourite/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;
		const userData = req.body; // formato x-www-form-urlencoded

		console.log('favorito a eliminar', userData.ads_favs);
		if (userData.ads_favs !== undefined) {
			const user = await User.findOne({ _id: _id });
			// Buscamos si el anuncio que queremos eliminar existe
			let index = user.ads_favs.indexOf(userData.ads_favs);
			if (index > -1) {
				console.log('id anuncio a eliminar existe');
				user.ads_favs.splice(index, 1);
				userData.ads_favs = user.ads_favs;
				console.log('Anuncio favorito eliminado del usuario');
			} else if (index === -1) {
				console.log('Anuncio favorito no encontrado en el usuario');
				res.status(404).json({ error: 'favourite not found' });
				return;
			}
		}
		console.log('UserData', userData);
		const userActualizado = await User.findOneAndUpdate(
			{ _id: _id },
			userData,
			{
				new: true,
				useFindAndModify: false,
			}
		);

		if (!userActualizado) {
			res.status(404).json({ error: 'not found' });
			return;
		}

		res.json({ result: userActualizado });
	} catch (error) {
		next(error);
	}
});

/**
 * DELETE /users: id (Elimina un usuario dado su id)
 * Deberá eliminar también los anuncios que le pertenezcan
 */
router.delete('/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;

		// 1º Deberá eliminar los anuncios que le pertenezcan
		try {
			const { deletedCount } = await Advertisement.deleteMany({ userId: _id });
			console.log(
				`\nEliminado${
					deletedCount > 1 ? 's' : ''
				} ${deletedCount} advertisement${
					deletedCount > 1 ? 's' : ''
				} del usuario.`
			);
		} catch (error) {
			next(error);
		}
		// 2º Eliminar el usuario
		//await Anuncio.remove({_id:_id}); para evitar el error de la consola deprecated
		await User.deleteOne({ _id: _id });
		res.json();
	} catch (error) {
		next(error);
	}
});

module.exports = router;
