'use strict';

require('dotenv').config();

const mongoose = require('./lib/connectMongoose');
const Usuario = require('./models/Usuario');

main().catch((err) => console.error(err));

async function main() {
  // inicializo colección de usuarios
  await initUsuariosDB();
  mongoose.close(function () {
    console.log('Desconectada db');
  });
}

async function initUsuariosDB() {
  //borrar  la registros BBDD
  const { deletedCount } = await Usuario.deleteMany();
  console.log(`Eliminados ${deletedCount} usuarios.`);

  const result = await Usuario.insertMany({
    username: 'admin',
    email: 'admin@example.com',
    password: await Usuario.hashPassword('1234'),
  });
  console.log(
    `Insertados ${result.length} usuario${result.length > 1 ? 's' : ''}.`
  );
}
