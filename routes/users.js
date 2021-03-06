var express = require('express');
var router = express.Router();
const fs = require("fs");
const path = require('path');
const { User, Advertisement, Conversation, Message } = require('../models');
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
		res.json({ resultado });
	} catch (err) {
		next(err);
	}
});

/**
 * GET /users/:id (Obtener un usuario por id)
 */
router.get('/:userId', async (req, res, next) => {
	try {
		const _userId = req.params.userId;
		//console.log(req.params.userId);
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
 * Se podrá actualizar cualquiera de los datos, incluida la contraseña
 */
router.put('/:id', jwtAuth, async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);
	try {
		const _id = req.params.id;
		let passwordEncript;
		//const userData = req.body;
		//console.log('USERDATA', userData);
		//console.log('REQ BODY', req.body);
		const { usernameNew, emailNew, passwordOld, passwordNew } = req.body;
		
		console.log('_id', _id)
		console.log('username', usernameNew)
		console.log('email', emailNew)
		console.log('password', passwordOld)
		console.log('passwordNew', passwordNew)

		// Comprobaciones de los datos del usuario que nos pasan no estén asignados a otro usuario
		// 1ª Nombre de usuario - no exista ya en BD para otro id de usuario 
		const user1 = await User.findOne({ username: usernameNew });
		if (user1) {
			if (user1._id != _id) {
				return res.status(202).json({ error: 'Invalid user name, assigned to another user' });
			}
		}
		// 2ª E-mail tampoco exista ya en BD para otro id de usuario 
		const user2 = await User.findOne({ email: emailNew });
		if (user2) {
			if (user2._id != _id) {
				return res.status(202).json({ error: 'Invalid email, assigned to another user' });
			}
		}
		
		const userOld = await User.findById({ _id: _id });
		if (!userOld) {
			return res.status(404).json({ error: 'user not found' });
		}
		
		// si nos pasan password actualizada, la actualizamos 
		// sino dejamos la actual que ya está encriptada
		if (passwordNew !== null && passwordNew !== undefined && passwordNew !== "") {
			//console.log('encripta la nueva clave')
			passwordEncript = await User.hashPassword(passwordNew);
			
		}
		else {
			
			passwordEncript = passwordOld;
		}
		
		// Actualizamos la cuenta del usuario con los datos nuevos y sus favoritos
		const userActualizado = await User.findOneAndUpdate(
			{ _id: _id },
		//	userData,
			{ username:usernameNew, email:emailNew, password: passwordEncript, ads_favs: userOld.ads_favs },
			{
				new: true,
				useFindAndModify: false,
			}
		);

		// usamos {new:true} para que nos devuelva el usuario actualizado, para evitar el error
		// de deprecated añade useFindAndModify:false

		if (!userActualizado) {
			res.status(404).json({ error: 'user not found' });
			return;
		}

		res.status(201).json({ result: userActualizado });
		//res.status(201).json('USERDATA UPDATED');
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
 * Eliminar los anuncios de los cuales es propietario,
 * como estos anuncios pueden estar incluidos en conversaciones de chat 
 * los eliminamos también, así como los mensajes de dichas conversaciones.
 * Eliminamos los anuncios del usuario eliminado de todos los array de favoritos 
 * que los contuvieran en otros usuarios.
 * Eliminamos los archivos de las imagenes relacionadas con estos anuncios del usuario
 */
router.delete('/:id', jwtAuth, async (req, res, next) => {
	
	const path_imagenes = path.join(__dirname, '../public/images/adverts/');
		
	try {
		const _id = req.params.id;  // Id de Usuario
		console.log('id de usuario', _id);
		
		try {
			
			// Buscamos los anuncios que le pertenecen al usuario
			const advertsUser = await Advertisement.find({ userId: _id });
			console.log('anuncios del usuario a eliminar', advertsUser);

			// Actualizamos los arrays de favoritos del resto de usuarios que contengan estos ids 
			for (i = 0; i < advertsUser.length; i++) {
				//por cada id de anuncio, buscamos que usuarios lo contienen entre sus favoritos
				// para eliminarlos
				
				try {
					const usersfavs = await User.find({ ads_favs: advertsUser[i]._id });
					for (j = 0; j < usersfavs.length; j++) {
						let index = usersfavs[j].ads_favs.indexOf(advertsUser[i]._id);
						if (index > -1) {
							console.log('id anuncio a eliminar existe');
							usersfavs[j].ads_favs.splice(index, 1);
							console.log('Anuncio favorito eliminado del array de favoritos del usuario de id', userfavs[j]._id);
						
							if (_id != usersfavs[j]._id) {
								console.log('no es el mismo usuario, actualizamos su array de favoritos');
								await User.findOneAndUpdate(
									{ _id: usersfavs[j]._id },
									usersfavs[j].ads_favs,
									{
										new: true,
										useFindAndModify: false,
									}
								);
							}
						}
					}
				}
				catch (error) {
					next(error);
				}
			}

			// Hacemos lo mismo con las conversaciones que contengan estos anuncios
			for (i = 0; i < advertsUser.length; i++) {
				// Obtenemos todas las conversaciones, para eliminar sus mensajes 
				const conversations = await Conversation.find({ advertisementId: advertsUser[i]._id });

				try {
					for (k = 0; k < conversations.length; k++) {
						console.log('Eliminando los mensajes de las conversaciones del id anuncio ', advertsUser[i]._id , ' y id de conversación ', conversations[k].conversationId );
						await Message.DeleteMany({conversationId: conversations[k].conversationId})
					}
				} catch (error) {
					next(error)	
				};

				try {
					// Borramos todas las posibles conversaciones por anuncios
					console.log('Borrando las conversaciones del id anuncio ', advertsUser[i]._id);
					await Conversation.deleteMany({ advertisementId: advertsUser[i]._id })
				}
				catch (error) {
					next(error)
				}

			}

			// Eliminamos las imágenes de estos anuncios del servidor
			
			for (i = 0; i < advertsUser.length; i++) {
				if (advertsUser[i].image != '') {
					if (fs.existsSync(path.join(path_imagenes, advertsUser[i].image))) {
						fs.unlinkSync(path.join(path_imagenes, advertsUser[i].image))
					}
				}
			}
			
			// Deberá eliminar los anuncios que le pertenezcan
			console.log('Eliminamos los anuncios del id usuario', _id);
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

		// Y por último eliminamos al usuario para completar su baja definitiva de wallaclone
		try {
			console.log('Eliminamos al usuario id ', _id);
			await User.deleteOne({ _id: _id });
			res.json();
		} catch (error) {
			next(error);
		};
	} catch (error) {
		next(error);
	}
});


/**
 * GET /notification_sold/:id_adv (Dado un id de anuncio que se ha marcado como vendido 
 * obtenemos todos los usuarios que lo contienen como anuncio favorito para notificarles por email, push, etc. )
 */
 router.get('/notification_sold/:id_adv', async (req, res, next) => {
	try {
		const _advertId = req.params.id;
		console.log('Anuncio id:', _advertId);

		const user = await User.find({
			ads_favs: { $in: [req.params.id] },
		});

		if (!user) {
			return res.status(404).json({ error: 'not found' });
		}
		res.json({ result: user });
	} catch (err) {
		next(err);
	}
});

/**
 * GET /notification_reserved/:id_adv (Dado un id de anuncio que se ha marcado como reservado 
 * obtenemos todos los usuarios que lo contienen como anuncio favorito para notificarles por email, push, etc. )
 */
router.get('/notification_reserved/:id_adv', async (req, res, next) => {
	try {
		const _advertId = req.params.id;
		console.log('Anuncio id:', _advertId);

		const user = await User.find({
			ads_favs: { $in: [req.params.id] },
		});

		if (!user) {
			return res.status(404).json({ error: 'not found' });
		}
		res.json({ result: user });
	} catch (err) {
		next(err);
	}
});

/**********************Get User from TOKEN************************************/

router.get('/auth/me', jwtAuth, async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);
	try {
		var userId = req.apiAuthUserId;
		console.log('userId del token', userId);

		const user = await User.findOne({ _id: userId });
		console.log(user);
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
