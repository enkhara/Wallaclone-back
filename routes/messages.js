'use strict';

const router = require('express').Router();
const Message = require('../models/Message');

//Add

router.post('/', async (res, req, next) => {
	const newMessage = new Message(req.body);
	console.log(req.body);
	console.log(newMessage);

	try {
		const saveMessage = await newMessage.save();
		console.log(saveMessage);
		res.status(200).json(saveMessage);
	} catch (err) {
		next(err);
	}
});

module.exports = router;
