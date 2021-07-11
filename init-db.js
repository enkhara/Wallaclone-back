'use strict';

require('dotenv').config();

const mongoose = require('./models/connectMongoose');
const Usuario = require('./models/Usuario');
const Anuncio = require('./models/Advertisement');
const anunciosData = require('./anuncios.json');

main().catch((err) => console.error(err));

async function main() {
  // inicializo colección de usuarios
  await initUsuariosDB();

  // Inicializo colección de anuncios
  await initAnunciosDb().catch(err=>{
    console.log('Error en init-db de anuncios a la base de datos: ', err);
  });

  mongoose.close(function () {
    console.log('Desconectada db');
  });
}

async function initUsuariosDB() {
  //borrar  la registros BBDD
  const { deletedCount } = await Usuario.deleteMany();
  console.log(`Eliminados ${deletedCount} usuarios.`);

  const result = await Usuario.insertMany([
    {
      username: 'admin',
      email: 'admin@example.com',
      password: await Usuario.hashPassword('1234'),
    },
    {
      username: 'amolto',
      email: 'amoltovil@gmail.com',
      password: await Usuario.hashPassword('4321')
    }
  ]);
  console.log(
    `Insertados ${result.length} usuario${result.length > 1 ? 's' : ''}.`
  );
}

async function initAnunciosDb(){
  const options = { ordered: true };
  if (Anuncio) {
      
      const promesa = Anuncio.deleteMany({});  
      try {
        //const result = await promesa;
        const { deletedCount } = await promesa;
          // `0` if no docs matched the filter, number of docs deleted otherwise
        console.log(`\nEliminado${deletedCount > 1 ? 's' : ''} ${deletedCount} anuncio${deletedCount > 1 ? 's' : ''}.`);
      }
      catch (err) {
        console.log('\nError al borrar la colección anuncios: ', err);
      }
    
      const promesa2 = Anuncio.insertMany(anunciosData, options);
      try{
        const result2 = await promesa2;
        console.log(`\nInsertado${result2.length > 1 ? 's' : ''} ${result2.length} anuncio${result2.length > 1 ? 's' : ''}.`)
        //    Anuncio.countDocuments({}, function(err, num_anuncios) {
        //       console.log(`\nInserted: ${num_anuncios} document${num_anuncios > 1 ? 's': ''} in collection anuncios`);
        //  });
           
      } catch(err) {
          console.log('Error de inserción masiva en la colección anuncios', err);
      }    
  } 
}

