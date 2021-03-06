var express = require('express');
var router = express.Router();
const path = require('path');
const { Advertisement, User } = require('../../models'); // cargamos los modelos
const jwtAuth = require('../../lib/jwtAuth');
const multer = require('multer');
const emailTransportConfigure = require('../../lib/emailTransportConfigure');
const mailer = require('../../lib/mailer');
const nodemailer = require('nodemailer');
const notification = require('../../controllers/notificationcontroller');

//const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'public';
const authPath = process.env.LOCAL_HOST_WEB_ADVERT;

//const cote = require('cote');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/images/adverts/'));
    //cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
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
    // ordena por precio ascendente y nombre descendente
    //http://localhost:3001/apiv1/advertisements/?sort=precio%20-nombre

    // Ordena por últimos anuncios, limitado a x anuncios mostrados
    //http://localhost:3001/apiv1/advertisements/?sort=-createdAt&limit=9

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
      return res.status(404).json({ error: 'advert not found' });
    }
    res.json({ result: advert });
  } catch (err) {
    next(err);
  }
});

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
    const { name, desc, transaction, price, tags } = req.body;
    if (req.file) {
      image = req.file.filename;
    }

    const advert = new Advertisement({
      name,
      desc,
      transaction,
      price,
      tags,
      image,
      userId,
    });

    const advertCreated = await advert.save(); // lo guarda en base de datos

    await advert.crear(); // le asigna el resto de campos (sell, reserved, createdAt, updatedAt)

    const _id = advertCreated._id;
    //console.log('Id de anuncio acabado de crear', _id);
    // lo devolvemos con los datos del usuario propietario del anuncio
    const advertCreatedExt = await Advertisement.findOne({ _id: _id }).populate(
      {
        path: 'userId',
      }
    );

    if (!advertCreatedExt) {
      return res.status(404).json({ error: 'advert not found' });
    }
    res.status(201).json({ result: advertCreatedExt });
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

    var image = '';
    const userId = req.apiAuthUserId;
    // Buscamos el anuncio por id y comprobamos que el anuncio pertenezca al userId que hace la petición
    const advertOld = await Advertisement.findOne({ _id: _id });
    const advert = await Advertisement.findOne({ _id: _id });
    //console.log('advert.userId', advert.userId ,'vs userId', userId)
    if (advert.userId != userId) {
      // Ojo != (no funciona !==)
      return res.status(403).json({ error: 'UserId without authorization' });
    }
    const { name, desc, transaction, price, tags, reserved, sold } = req.body;
    console.log(
      `control antes de hacer las logicas de guardar los cambios`,
      req.body
    );
    if (req.file) {
      image = req.file.filename;
    } else {
      // no nos pasan la imagen, mantenemos la imagen actual
      image = advertOld.image;
    }
   
    //Convertimos string de tags en array
    var strArr = tags.replace(/\s+/g, '').split(',');
    var tagsArray = [];
    for (i = 0; i < strArr.length; i++) {
      tagsArray.push(strArr[i]);
    }

    const anuncioActualizado = await Advertisement.findOneAndUpdate(
      { _id: _id },
      {
        name,
        desc,
        transaction,
        price,
        tags: tagsArray,
        reserved,
        sold,
        image,
        userId,
      },
      {
        new: true,
        useFindAndModify: false,
      }
    ).populate({ path: 'userId' });

    // usamos {new:true} para que nos devuelva el anuncio actualizado, para evitar el error
    // de deprecated añade useFindAndModify:false

    if (price != advertOld.price) {
      //notifica que ha cambiado el precio
      console.log('precio new', price);
      console.log('precio viejo', advertOld);
      const title =
        'The price of the' +
        `${name}` +
        ' ad has changed, ' +
        `${price}` +
        ' € revised !!!';
      const link = `${authPath}${name}/${_id}`;
      const msg =
        'Please click on the follwoing link, or paste this into your browser to complete the process';
      notification(req.params, title, msg, link);
    }

    let paintReserved = '';
    let reservedNew;
    if (reserved == 'true') {
      reservedNew = /true/i.test('true');
      paintReserved = 'reserved';
    } else {
      reservedNew = /true/i.test('false');
      paintReserved = 'no reserverd';
    }
    if (reservedNew !== advertOld.reserved) {
      const title =
        'The advert ' +
        `${name}` +
        ' you had in your favorites in wallaclone has been ' +
        `${paintReserved}`;
      const link = `${authPath}${name}/${_id}`;
      const msg =
        'Please click on the follwoing link, or paste this into your browser to complete the process';
      notification(req.params, title, msg, link);
    }
    let soldNew = false;
    if (sold === 'true') {
      soldNew = /true/i.test('true');
    } else {
      soldNew = /true/i.test('false');
    }
    // console.log('sold booleana new', soldNew);
    if (soldNew === !advertOld.sold) {
      //notifica que ha cambiado de vendido
      const title =
        'The advert ' +
        `${name}` +
        ' you had in your favorites in wallaclone has been sold';
      const link = `${authPath}${name}/${_id}`;
      const msg =
        'Please click on the follwoing link, or paste this into your browser to complete the process';
      notification(req.params, title, msg, link);
    }
    if (!anuncioActualizado) {
      res.status(404).json({ error: 'not found' });
      return;
    }
   
    const anuncioActualizadoExt = await Advertisement.findOne({
      _id: _id,
    }).populate({
      path: 'userId',
    });

    if (!anuncioActualizadoExt) {
      return res.status(404).json({ error: 'advert not found' });
    }

    res.status(201).json({ result: anuncioActualizadoExt });
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
      return res.status(403).json({ error: 'UserId without authorization' });
    }

    //await Anuncio.remove({_id:_id}); para evitar el error de la consola deprecated
    await Advertisement.deleteOne({ _id: _id });
    res.status(201).json();
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /apiv1/advertisements/user/:user_id (Eliminará todos los anuncios dado un user_id)
 * este endpoint no se utliza
 */
router.delete('/user/:id', jwtAuth, async (req, res, next) => {
  try {
    const _userId = req.params.id;

    // Borrará todos los anuncios del usuario que le pasamos como parámetro
    await Advertisement.deleteMany({ userId: _userId });
    res.status(201).json();

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /apiv1/advertisements/changereserved/:id de anuncio/
 * Actualizar un anuncio, en el body le pasamos lo que queremos actualizar
 * solo el usuario propietario del anuncio puede modificarlo
 */
router.put('/changereserved/:id', jwtAuth, async (req, res, next) => {
  console.log(
    `El usuario que está haciendo la petición es ${req.apiAuthUserId}`
  );

  try {
    const _id = req.params.id;
    //const anuncioData = req.body;

    const userId = req.apiAuthUserId;
    // Buscamos el anuncio por id y comprobamos que el anuncio pertenezca al userId que hace la petición
    const advertOld = await Advertisement.findOne({ _id: _id });
    const advert = await Advertisement.findOne({ _id: _id });
    //console.log('advert.userId', advert.userId ,'vs userId', userId)
    if (advert.userId != userId) {
      // Ojo != (no funciona !==)
      return res.status(403).json({ error: 'UserId without authorization' });
    }

//	console.log('req.body', req.body)  
	const { reserved } = req.body;
	//console.log('reserved recibido', reserved)
    if (reserved != undefined) {
      if (reserved == 'true' || reserved == true) {
        await advert.reservar();
        
        const { reserved, name } = req.body;
        if (reserved != undefined) {
          let paintReserved = '';
          let reservedNew;
          if (reserved == 'true') {
            reservedNew = /true/i.test('true');
            paintReserved = 'reserved';
          } else {
            reservedNew = /true/i.test('false');
            paintReserved = 'no reserverd';
          }
    
          if (reservedNew !== advertOld.reserved) {
            //console.log('entro en reservar', reserved);
            const title =
              'The advert ' +
              `${name}` +
              ' you had in your favorites in wallaclone has been ' +
              `${paintReserved}`;
            const link = `${authPath}${name}/${_id}`;
            const msg =
              'Please click on the follwoing link, or paste this into your browser to complete the process';
            notification(req.params, title, msg, link);
          }
        }
      } else {
        //console.log('entro en desreservar', reserved);
        await advert.desreservar();
      }
    } else {
      //console.log('Salimos sin actualizar reserved', reserved);
      return res
        .status(404)
        .json({ error: 'data not changed, please review url request' });
    }

    const anuncioActualizadoExt = await Advertisement.findOne({
      _id: _id,
    }).populate({
      path: 'userId',
    });

    if (!anuncioActualizadoExt) {
      return res.status(404).json({ error: 'advert not found' });
    }

    res.status(201).json({ result: anuncioActualizadoExt });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /apiv1/advertisements/changesold/:id de anuncio/
 * Actualizar un anuncio, en el body le pasamos lo que queremos actualizar
 * solo el usuario propietario del anuncio puede modificarlo
 */
router.put('/changesold/:id', jwtAuth, async (req, res, next) => {
  console.log(
    `El usuario que está haciendo la petición es ${req.apiAuthUserId}`
  );

  try {
    const _id = req.params.id;
    //const anuncioData = req.body;

    const userId = req.apiAuthUserId;
    // Buscamos el anuncio por id y comprobamos que el anuncio pertenezca al userId que hace la petición
    const advertOld = await Advertisement.findOne({ _id: _id });
    const advert = await Advertisement.findOne({ _id: _id });
    //console.log('advert.userId', advert.userId ,'vs userId', userId)
    if (advert.userId != userId) {
      // Ojo != (no funciona !==)
      return res.status(403).json({ error: 'UserId without authorization' });
    }

     const { sold, name } = req.body;
     if (sold != undefined) {
       if (sold == 'true' || sold == true) {
        //console.log('entro en vender', sold);
    
         await advert.vender();
          let soldNew;
          if (sold === 'true') {
            soldNew = /true/i.test('true');
          } else {
            soldNew = /true/i.test('false');
          }
          console.log('sold booleana new', soldNew);
          //console.log('entro en vender', sold);

         if (soldNew === !advertOld.sold) {
           //notifica que ha cambiado de vendido
           const title =
             'The advert ' +
             `${name}` +
             ' you had in your favorites in wallaclone has been sold';
           const link = `${authPath}${name}/${_id}`;
           const msg =
             'Please click on the follwoing link, or paste this into your browser to complete the process';
           notification(req.params, title, msg, link);
         }
      } else {
        //console.log('entro en no vender', sold);
        await advert.no_Vender();
      }
    } else {
      //console.log('salimos sin actualizar', sold);
      return res
        .status(404)
        .json({ error: 'data not changed, please review url request' });
    }

    const anuncioActualizadoExt = await Advertisement.findOne({
      _id: _id,
    }).populate({
      path: 'userId',
    });

    if (!anuncioActualizadoExt) {
      return res.status(404).json({ error: 'advert not found' });
    }

    res.status(201).json({ result: anuncioActualizadoExt });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
