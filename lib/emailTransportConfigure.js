'use strict';

const nodemailer = require('nodemailer');

module.exports = async function() {

  let testAccount = await nodemailer.createTestAccount();  
 
  const developTransport = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    }
  };

  const prodTransport = {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_SERVICE_USER,
      pass: process.env.EMAIL_SERVICE_PASS
    }
  }

  const transportInfo = process.env.NODE_ENV === 'development' ?
    developTransport :
    prodTransport;

  // crear un transport según el entorno
  return nodemailer.createTransport(transportInfo);

};
