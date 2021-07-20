var express = require('express');
const Advertisement = require('../../models/Advertisement');
var router = express.Router();

// cargamos el modelo
const Advertisemnet = require('../../models/Advertisement');

/* GET /api/tags */
// listara los distintos tags de los documentos de anuncios en la base de datos
router.get('/', async function (req, res, next) {
	try {
		const resultado = await Advertisement.listaTags();
		res.json(resultado);
	} catch (err) {
		next(err);
	}
});

router.get('/allTags', async function (req, res, next) {
	try {
		const result = await Advertisement.allowedTags();
		res.json(result);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
