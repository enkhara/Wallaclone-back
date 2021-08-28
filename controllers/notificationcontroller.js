'use strict';

const { User } = require('../models');
const emailTransportConfigure = require('../lib/emailTransportConfigure');
const nodemailer = require('nodemailer'); // cargamos los modelos

module.exports = async function notification(reqParams, title, msg, link) {
  const _advertId = reqParams.id;
  try {
    const usersIdWhitFavoriteAdvert = await User.find({
      ads_favs: { $in: [reqParams.id] },
    });

    usersIdWhitFavoriteAdvert.forEach(async (element) => {
      let message = {
        from: process.env.EMAIL_SERVICE_FROM,
        to: element.email,
        subject: title,
        text: msg,
        html: `<a href='${link}'>${link}</a>`,
      };
      console.log('message', message);
      const transporter = await emailTransportConfigure();

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log('Error occurred. ' + err.message);
          return process.exit(1);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({ message: 'Somenthing goes wrong !' });
  }
};
