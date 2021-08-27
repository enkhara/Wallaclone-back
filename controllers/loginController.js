'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const emailTransportConfigure = require('../lib/emailTransportConfigure');
const mailer = require('../lib/mailer.js');
const mailerLink = require('../lib/mailerLink');
const nodemailer = require('nodemailer');

class LoginController {
  /**
   * POST /auth/signup (User Register)
   */

  async post(req, res, next) {
    const { username, email, password } = req.body;

    try {
      const passwordEncript = await User.hashPassword(password);
      await User.create({
        username: username,
        email: email,
        password: passwordEncript,
      });
      const htmlMessage = `<b>Thank you for registering</b><br></br>
        <p>We welcome you to the largest community of shopping between people !!!</p>`;

      const message = await mailer(email, 'Welcome Wallaclone', htmlMessage);
      const transporter = await emailTransportConfigure();

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log('Error occurred. ' + err.message);
          return process.exit(1);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
      res.status(201).json('USER REGISTERED');
    } catch (error) {
      return res.status(400).json({
        message: 'Somenthing goes wrong !  user already registered',
      });
    }
  }

  /**
   * POST /auth/signin (User login)
   */
  async postJWT(req, res, next) {
    try {
      const { username, password } = req.body;

      const usuario = await User.findOne({ username });

      if (!usuario || !(await usuario.comparePassword(password))) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        next(error);
        return;
      }

      jwt.sign(
        { _id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' },
        (err, jwtToken) => {
          if (err) {
            next(err);
            return;
          }
          res.json({ token: jwtToken });
        }
      );
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    const { email } = req.body;
    const message = 'check your email link to reset your password';

    const authPath = process.env.LOCAL_HOST_WEB_NEW_PASSWORD;

    let verificationLinks;
    let emailStatus = 'ok';

    try {
      const user = await User.findOne({ email });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      verificationLinks = `${authPath}new-password/${user._id}/${token}`;
      const message = await mailerLink(
        email,
        'Forgot Password',
        verificationLinks
      );
      const transporter = await emailTransportConfigure();

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log('Error occurred. ' + err.message);
          return process.exit(1);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
    } catch (error) {
      console.log(error);

      return res.status(400).json({ message: 'Somenthing goes wrong !' });
    }

    res
      .status(201)
      .json({ message, info: emailStatus, test: verificationLinks });
  }

  async createNewPassword(req, res, next) {
    const { newPassword, id } = req.body;

    if (!(newPassword && id)) {
      res.status(400).json({ message: 'requires fields' });
    }

    try {
      const user = await User.findOne({ id });

      const newPasswordCription = await User.hashPassword(newPassword);

      await User.updateOne(user, { password: newPasswordCription });
    } catch (error) {
      return res.status(400).json({ message: 'Somenthing goes wrong !' });
    }
    res.status(201).json({ message: 'update ' });
  }
}

module.exports = new LoginController();
