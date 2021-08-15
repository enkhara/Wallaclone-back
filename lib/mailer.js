'use strict';

const nodemailer = require('nodemailer');

module.exports = async function (to, subject, message) {
  return {
    from: process.env.EMAIL_SERVICE_FROM,
    to: to,
    subject: subject,
    html: `
        <br><br>
        <p${message}</p>`,
  };
};
