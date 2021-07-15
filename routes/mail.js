'use strict';

var express = require('express');
var router = express.Router();
//const { Usuario } = require('../models');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

/**
 * EMAIL, envia email
 */
router.get('/', async (req, res, next) => {
    
    // mandar un email al usuario
    
    //const info = await usuario.enviaEmail('Este es el asunto', 'Bienvenido a Wallaclone');

    const transport = await emailTransportConfigure();
    //console.log('transport', transport);
    // enviar el correo
    const info = await transport.sendMail({
      from: process.env.EMAIL_SERVICE_FROM,
      to: this.email, //mail del usuario
    //   subject: asunto,
    //   html: cuerpo
      subject: 'este es el asunto',
      html:'Bienvenido a Wallaclone'
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

});

module.exports = router;
