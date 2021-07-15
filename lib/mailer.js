'use strict';

const nodemailer = require('nodemailer');
module.exports = async function (to, subject, link) {
  return {
    from: process.env.EMAIL_SERVICE_FROM,
    to: to,
    subject: subject,
    html: `<b>Please click on the follwoing link, or paste this into your browser to complete the process:</b>
        <br><br>
        <a href='${link}'>${link}</a>`,
  };
};
