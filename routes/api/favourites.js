var express = require('express');
var router = express.Router();
const path = require('path');
const { Advertisement, User } = require('../../models'); 
const jwtAuth = require('../../lib/jwtAuth');

/**
 * API ZONA PRIVADA (Necesita el token para acceder)
 */

/**
 * GET /apiv1/favourites/:userId 
 * Obtiene la informacion de los anuncios favoritos dado un usuario (recogido por params)
 */
 router.get('/:userId', jwtAuth, async (req, res, next) => {
	try {
		const userId = req.params.userId;
		
		// Obtenemos la información del usuario (ads_favs)
		const user = await User.findOne({ _id: userId });

		if (!user) {
			return res.status(404).json({ error: 'user not found' });
		}
		
        //console.log('ARRAY DE ANUNCIOS FAVORITOS', user.ads_favs )

        const result = await Advertisement.find({ _id: { $in: user.ads_favs } });
    
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

module.exports = router;