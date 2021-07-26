var express = require('express');
var router = express.Router();
const path = require('path');
const { Advertisement, User } = require('../../models'); // cargamos los modelos
const jwtAuth = require('../../lib/jwtAuth');
const multer = require('multer');
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'public';

//const cote = require('cote');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../public/images/adverts/'));
		//cb(null, UPLOAD_FOLDER);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

/**
 * API ZONA PÚBLICA (No necesita el token)
 */

/**
 * GET /apiv1/advertisements (listar anuncios)
 */
router.get('/', async function (req, res, next) {
	try {
		//console.log(`El usuario que está haciendo la petición es ${req.apiAuthUserId}`);

		let precios = [];
		let vtags = [];

		const name = req.query.name;
		const desc = req.query.desc;
		const transaction = req.query.transaction;
		const price = req.query.price;
		const tags = req.query.tags;
		const sold = req.query.sold;
		const reserved = req.query.reserved;
		// http://localhost:3001/apiv1/advertisements/?userId=60eb19914d799d6a125a6669
		const userId = req.query.userId;

		const limit = parseInt(req.query.limit); //lo convierte a num porque todo en req es string
		const skip = parseInt(req.query.skip); // para paginar skip

		const fields = req.query.fields;
		//http://localhost:3001/apiv1/advertisements//?fields=precio%20nombre%20-_id
		const sort = req.query.sort;
		//http://localhost:3001/apiv1/advertisements/?sort=precio%20-nombre
		// ordena por precio ascendente y nombre descendente

		const filtro = {};
		if (name) {
			filtro.name = new RegExp('^' + name, 'i');
		}
		if (desc) {
			filtro.desc = new RegExp('^' + desc, 'i');
		}
		if (transaction) {
			filtro.transaction = transaction;
		}
		if (sold) {
			filtro.sold = sold;
		}
		if (reserved) {
			filtro.reserved = reserved;
		}
		if (userId) {
			filtro.userId = userId;
		}

		if (price) {
			if (price.includes('-')) {
				precios = precio.split('-');
				if (precios.length == 2) {
					if (
						!isNaN(parseFloat(precios[0])) &&
						!isNaN(parseFloat(precios[1]))
					) {
						filtro.price = {
							$gte: parseFloat(precios[0]),
							$lte: parseFloat(precios[1]),
						};
					} else if (
						isNaN(parseFloat(precios[0])) &&
						!isNaN(parseFloat(precios[1]))
					) {
						// buscará los anuncios que sean menores a este precio
						filtro.price = { $lte: parseFloat(precios[1]) };
					} else if (
						!isNaN(parseFloat(precios[0])) &&
						isNaN(parseFloat(precios[1]))
					) {
						// buscara los anuncios de precio mayor a este
						filtro.price = { $gte: parseFloat(precios[0]) };
					}
				}
			} else {
				// solo nos pasan un precio, buscaremos solo por precio
				filtro.price = price;
			}
		}
		// podremos buscar por varios tags separados por comas
		if (tags) {
			if (tags.includes(',')) {
				vtags = tags.split(',');
				filtro.tags = { $in: vtags };
			} else {
				filtro.tags = { $in: tags };
			}
		}

		const resultado = await Advertisement.lista(
			filtro,
			limit,
			skip,
			fields,
			sort
		);

		res.json(resultado);
	} catch (err) {
		next(err);
	}
});

/**
 * GET /apiv1/advertisements:id (Obtener un anuncio por su id)
 * Además se trae los datos del usuario id propietario con populate
 */
router.get('/:id', async (req, res, next) => {
	try {
		const _id = req.params.id;

		const advert = await Advertisement.findOne({ _id: _id }).populate({
			path: 'userId',
		});

		if (!advert) {
			return res.status(404).json({ error: 'not found' });
			// es lo mismo la sentencia de arriba a lo de aqui abajo
			//res.status(404).json({error: 'not found'});
			//return;
		}
		res.json({ result: advert });
	} catch (err) {
		next(err);
	}
});

/** GET TAGS  /apiv1/advertisements/tags */
router.get('/tags', function (req, res) {
	console.log('pedimos tags');
	res.json({ ok: true, allowedTags: Advertisement.allowedTags() });
});

/** GET anuncios/paginación */
// router.get('/adverts/:page', (req, res, next) => {
// 	const perPage = 9;
// 	const page = req.params.page || 1;

// 	Advertisement.find({})
// 		.skip(perPage * page - perPage)
// 		.limit(perPage)
// 		.exec((err, adverts) => {
// 			Advertisement.count((err, count) => {
// 				if (err) return next(error);
// 				res.render('/adverts/adverts', {
// 					adverts,
// 					current: page,
// 					pages: Math.ceil(count / perPage),
// 				});
// 			});
// 		});
// });

/**
 * API ZONA PRIVADA (Necesita el token para acceder)
 */

/**
 * POST /apiv1/advertisements (body) crear un anuncio
 */

router.post('/', jwtAuth, upload.single('image'), async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);

	try {
		var image = '';
		var userId = req.apiAuthUserId;
		const { name, desc, transaction, price, tags, updatedAt } = req.body;
		if (req.file) {
			image = req.file.filename;
		}

		const anuncio = new Advertisement({
			name,
			desc,
			transaction,
			price,
			tags,
			updatedAt,
			image,
			userId,
		});

		const anuncioCreado = await anuncio.save(); // lo guarda en base de datos

		await anuncio.crear(); // le asigna el resto de campos (sell, reserved, updatedAt)

		res.status(201).json({ result: anuncioCreado });
	} catch (error) {
		next(error);
	}
});

/**
 * PUT /apiv1/advertisements/:id de anuncio
 * Actualizar un anuncio, en el body le pasamos lo que queremos actualizar
 * solo el usuario propietario del anuncio puede modificarlo
 */
router.put('/:id', jwtAuth, upload.single('image'), async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);

	try {
		const _id = req.params.id;
		//const anuncioData = req.body;

		var image = '';
		const userId = req.apiAuthUserId;
		// Buscamos el anuncio por id y comprobamos que el anuncio pertenezca al userId que hace la petición
		const advert = await Advertisement.findOne({ _id: _id });
		//console.log('advert.userId', advert.userId ,'vs userId', userId)
		if (advert.userId != userId) {
			// Ojo != (no funciona !==)
			return res.status(403).json({ error: 'userId without authorization' });
		}

		const { name, desc, transaction, price, tags, updatedAt } = req.body;
		if (req.file) {
			image = req.file.filename;
		}
		// Si la imagen no viene cargada, se entiende que la han borrado?????
		const anuncioActualizado = await Advertisement.findOneAndUpdate(
			{ _id: _id },
			{ name, desc, transaction, price, tags, updatedAt, image, userId },
			{
				new: true,
				useFindAndModify: false,
			}
		);

		// usamos {new:true} para que nos devuelva el anuncio actualizado, para evitar el error
		// de deprecated añade useFindAndModify:false

		if (!anuncioActualizado) {
			res.status(404).json({ error: 'not found' });
			return;
		}

		await anuncioActualizado.actualizar(); // le actualizamos el campo de la fecha updateAt
		res.json({ result: anuncioActualizado });
	} catch (error) {
		next(error);
	}
});

/**
 * DELETE /apiv1/advertisements: id (Elimina un anuncio dado su id)
 */
router.delete('/:id', jwtAuth, async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);

	try {
		const _id = req.params.id;
		const userId = req.apiAuthUserId;
		// Buscamos el anuncio por id y comprobamos que el anuncio pertenezca
		// al userId que hace la petición para dejarle eliminar el anuncio.
		const advert = await Advertisement.findOne({ _id: _id });

		if (advert.userId != userId) {
			// Ojo != (no funciona !==)
			return res.status(403).json({ error: 'userId without authorization' });
		}

		//await Anuncio.remove({_id:_id}); para evitar el error de la consola deprecated
		await Advertisement.deleteOne({ _id: _id });
		res.json();
	} catch (error) {
		next(error);
	}
});

/**
 * DELETE /apiv1/advertisements/user/:user_id (Eliminará todos los anuncios dado un user_id)
 */
router.delete('/user/:id', jwtAuth, async (req, res, next) => {
	try {
		const _userId = req.params.id;

		// Borrará todos los anuncios del usuario que le pasamos como parámetro
		await Advertisement.deleteMany({ userId: _userId });
		res.json();
	} catch (error) {
		next(error);
	}
});

module.exports = router;
