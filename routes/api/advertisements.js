var express = require('express');
var router = express.Router();
const path = require('path');
const Advertisement = require('../../models/Advertisement'); // cargamos el modelo
const jwtAuth = require('../../lib/jwtAuth');
const multer = require('multer');
//const cote = require('cote');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../public/images/adverts/'));
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
 * GET /api/anuncios (listar anuncios)
 */
router.get('/', async function (req, res, next) {
	try {
		//console.log(`El usuario que está haciendo la petición es ${req.apiAuthUserId}`);

		var precios = [];
		var vtags = [];

		const name = req.query.name;
		const sale = req.query.sale;
		const price = req.query.price;
		const tags = req.query.tags;
		const sell = req.query.sell;
		const reserved = req.query.reserved;
		// http://localhost:3001/apiv1/advertisements/?userId=60eb19914d799d6a125a6669
		const userId = req.query.userId;

		const limit = parseInt(req.query.limit); //lo convierte a num porque todo en req es string
		const skip = parseInt(req.query.skip); // para paginar skip
		const fields = req.query.fields;
		//http://localhost:3000/api/anuncios/?fields=precio%20nombre%20-_id
		const sort = req.query.sort;
		//http://localhost:3000/api/anuncios/?sort=precio%20-nombre
		// ordena por precio ascendente y nombre descendente

		const filtro = {};
		if (name) {
			filtro.name = new RegExp('^' + name, 'i');
			//filtro.nombre = nombre
		}
		if (sale) {
			filtro.sale = sale;
		}
		if (sell) {
			filtro.sell = sell;
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
 * GET /api/anuncios:id (Obtener un advert por id)
 */
router.get('/:id', async (req, res, next) => {
	try {
		const _id = req.params.id;

		const advert = await Advertisement.findOne({ _id: _id });

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
 * GET /api/anuncios/user:UserId (Obtener los anuncios por userId)
 */
//  router.get('/user:id', async (req, res, next)=>{
//     try {
//         const _userId = req.params.id;

//         const advert = await Advertisement.find({ userId: _userId })

//         if (!advert) {
//             return res.status(404).json({error: 'not found'});
//             // es lo mismo la sentencia de arriba a lo de aqui abajo
//             //res.status(404).json({error: 'not found'});
//             //return;
//         }
//         res.json({result:advert});

//     } catch(err) {
//         next(err);
//     }
// });

/**
 * API ZONA PRIVADA (Necesita el token para acceder)
 */

/**
 * POST /api/anuncios (body) crear un advert
 */

router.post('/', jwtAuth, upload.single('image'), async (req, res, next) => {
	console.log(
		`El usuario que está haciendo la petición es ${req.apiAuthUserId}`
	);

	try {
		var image = '';
		var userId = req.apiAuthUserId;
		const { name, sale, price, tags, updatedAt } = req.body;
		if (req.file) {
			image = req.file.filename;
		}
		//console.log('req.file', req.file);
		//console.log('req.file.filename', req.file.filename);
		//const anuncioData = req.body;

		const advert = new Advertisement({
			name,
			sale,
			price,
			tags,
			updatedAt,
			image,
			userId,
		});

		const anuncioCreado = await advert.save(); // lo guarda en base de datos

		await advert.crear(); // le asigna el resto de campos (sell, reserved, updatedAt)

		res.status(201).json({ result: anuncioCreado });
	} catch (error) {
		next(error);
	}
});

/**
 * PUT /api/anuncios:id (body)
 * Actualizar un advert, en el body le pasamos lo que queremos actualizar
 */
router.put('/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;
		const anuncioData = req.body;

		const anuncioActualizado = await Advertisement.findOneAndUpdate(
			{ _id: _id },
			anuncioData,
			{
				new: true,
				useFindAndModify: false,
			}
		);

		// usamos {new:true} para que nos devuelva el advert actualizado, para evitar el error
		// de deprecated añade useFindAndModify:false

		if (!anuncioActualizado) {
			res.status(404).json({ error: 'not found' });
			return;
		}

		res.json({ result: anuncioActualizado });
	} catch (error) {
		next(error);
	}
});

/**
 * DELETE /api/advert: id (Elimina un advert dado su id)
 */
router.delete('/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;

		//await Anuncio.remove({_id:_id}); para evitar el error de la consola deprecated
		await Advertisement.deleteOne({ _id: _id });
		res.json();
	} catch (error) {
		next(error);
	}
});

module.exports = router;
