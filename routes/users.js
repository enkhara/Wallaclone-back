var express = require('express');
var router = express.Router();
const User = require('../models/Usuario');
const Advertisement = require('../models/Advertisement');
const jwtAuth = require('../lib/jwtAuth');

/* GET /users listing. */
router.get('/', async function (req, res, next) {

	//res.send('respond with a resource');
	try {
		const username = req.query.username;
		const email = req.query.email;
		
		const limit = parseInt(req.query.limit);  //lo convierte a num porque todo en req es string
        const skip = parseInt(req.query.skip);   // para paginar skip
        const fields = req.query.fields;
        const sort = req.query.sort;

		const filtro = {}
        if (username) {
            filtro.username = new RegExp('^' + username, "i")  
		}
		if (email) {
            filtro.email = new RegExp('^' + email, "i")  
		}

		const resultado = await User.lista(filtro, limit, skip, fields, sort)
        res.json(resultado);

	}
	catch (err) {
		next(err);
	}

});

/**
 * GET /users/:id (Obtener un usuario por id)
 */
 router.get('/:userId', async (req, res, next)=>{
    try {
        const _userId = req.params.id;

        const user = await User.findOne({ _id: _userId })

        if (!user) {
            return res.status(404).json({error: 'not found'}); 
        }
        res.json({result:user});

    } catch(err) {
        next(err);
    }
 });

  
 /**
 * GET /users/adverts/:userId (Obtener los anuncios por userid)
 */
//    router.get('/adverts/:userId', async (req, res, next)=>{
//      try {
//          const _userId = req.params.userId;

//          const user = await User.findById({ _id: _userId })

//          if (!user) {
//              return res.status(404).json({error: 'not found'}); 
// 		 }
		 
// 		 const adverts = await Advertisement.find({ userid: user.userId })
// 		  if (!adverts) {
// 		 	return res.status(404).json({error: 'not found adverts for user'}); 
// 		 }
//          res.json({result:adverts});

//      } catch(err) {
//          next(err);
//      }
//    });


/**
 * PUT /users/:id (body)  
 * Actualizar un usuario, en el body le pasamos lo que queremos actualizar
 */
 router.put('/:id', jwtAuth, async (req, res, next) =>{
    try {
        const _id = req.params.id;
        const userData = req.body;
        
        const userActualizado = await User.findOneAndUpdate({_id:_id}, userData, {
             new: true, 
             useFindAndModify: false
         });

        // usamos {new:true} para que nos devuelva el usuario actualizado, para evitar el error
        // de deprecated añade useFindAndModify:false

        if (!userActualizado){
            res.status(404).json({error: 'not found'});
            return;
        }

        res.json({result:userActualizado});
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /user: id (Elimina un usuario dado su id)
 * TODO: Deberá eliminar todos sus anuncios, favoritos, etc..
 */
router.delete('/:id', jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;

		//await Anuncio.remove({_id:_id}); para evitar el error de la consola deprecated
		await User.deleteOne({ _id: _id });
		res.json();

	} catch (error) {
		next(error);
	}
});

module.exports = router;
