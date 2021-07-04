'use strict';

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

class LoginController {
  /**
   * POST /auth/signin
   */
  async postJWT(req, res, next) {
    try {
      const { email, password } = req.body;

      // buscar el usuario en la BD
      const usuario = await Usuario.findOne({ email });

      // si no lo encontramos --> error
      // si no coincide la clave --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        const error = new Error('invalid credentials');
        error.status = 401;
        next(error);
        return;
      }

      // si el usuario existe y la clave coincide

      /** crear un token JWT (firmado)
       * para generar el tokes se usa metodo sign pasa el usuario, la firma de decodificacion , el tiempo de valides y por ultimo un callback primero el error y luego devuelve un jason con el token
       * */
      jwt.sign(
        { _id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '2h' },
        (err, jwtToken) => {
          if (err) {
            next(err);
            return;
          }
          // devolveselo al cliente
          res.json({ token: jwtToken });
        }
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LoginController();
