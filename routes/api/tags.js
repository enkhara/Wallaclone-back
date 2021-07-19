var express = require('express');
var router = express.Router();

// cargamos el modelo
const Anuncio = require('../../models/Advertisement');

/* GET /api/tags */
// listara los distintos tags de los documentos de anuncios en la base de datos
router.get('/', async function(req, res, next) {
    try {

        const resultado = await Anuncio.listaTags();
        res.json(resultado);

    } catch (err) {
        next(err);
    }
});

module.exports = router;