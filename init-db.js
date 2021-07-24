'use strict';

require('dotenv').config();

const { mongoose, connectMongoose, User, Advertisement } = require('./models');
// const mongoose = require('./models/connectMongoose');
const anunciosData = require('./anuncios.json');

main().catch((err) => console.error(err));

async function main() {
	// inicializo colección de Users
	await initUsersDB();

	// Inicializo colección de anuncios
	await initAdvertisementsDb().catch((err) => {
		console.log('Error en init-db de anuncios a la base de datos: ', err);
	});

	mongoose.connection.close(function () {
		console.log('Desconectada db');
	});
}

async function initUsersDB() {
	//borrar  la registros BBDD
	const { deletedCount } = await User.deleteMany();
	console.log(`Eliminados ${deletedCount} Users.`);

	const result = await User.insertMany([
		{
			username: 'admin',
			email: 'admin@example.com',
			password: await User.hashPassword('1234'),
		},
		{
			username: 'amolto',
			email: 'amoltovil@gmail.com',
			password: await User.hashPassword('4321'),
		},
	]);
	console.log(
		`Insertados ${result.length} User${result.length > 1 ? 's' : ''}.`
	);
}

async function initAdvertisementsDb() {
	const options = { ordered: true };
	if (Advertisement) {
		const promesa = Advertisement.deleteMany({});
		try {
			//const result = await promesa;
			const { deletedCount } = await promesa;
			// `0` if no docs matched the filter, number of docs deleted otherwise
			console.log(
				`\nEliminado${deletedCount > 1 ? 's' : ''} ${deletedCount} anuncio${
					deletedCount > 1 ? 's' : ''
				}.`
			);
		} catch (err) {
			console.log('\nError al borrar la colección anuncios: ', err);
		}

		const promesa2 = Advertisement.insertMany(anunciosData, options);
		try {
			const result2 = await promesa2;
			console.log(
				`\nInsertado${result2.length > 1 ? 's' : ''} ${result2.length} anuncio${
					result2.length > 1 ? 's' : ''
				}.`
			);
			//    Advertisement.countDocuments({}, function(err, num_anuncios) {
			//       console.log(`\nInserted: ${num_anuncios} document${num_anuncios > 1 ? 's': ''} in collection anuncios`);
			//  });
		} catch (err) {
			console.log('Error de inserción masiva en la colección anuncios', err);
		}
	}
}
