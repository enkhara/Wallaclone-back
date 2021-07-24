'use strict';

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	// recoger el jwtToken de la cabecera (o de otros sitios)
	let jwtToken ='';
	const jwtTokenReq =
		req.get('Authorization') || req.query.token || req.body.token;
	
	if (jwtTokenReq.includes("Bearer")) {
	
		jwtToken = jwtTokenReq.substring(7); // le quitamos el literal "Bearer"
		//console.log('JWT sin Bearer', jwtToken);
	}
	else {
	
		jwtToken = jwtTokenReq;
	}
	
	// comprobar que tengo token
	if (!jwtToken) {
		console.log('no obtengo token');
		const error = new Error('no token provided');
		error.status = 401;
		next(error);
		return;
	}

	// comprobar que el token es valido
	jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
		if (err) {
			console.log('error de verificación de token');
			err.status = 401;
			next(err);
			return;
		}
		req.apiAuthUserId = payload._id;
		next();
	});
};
