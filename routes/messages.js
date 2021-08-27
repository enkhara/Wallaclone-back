'use strict';
const jwtAuth = require('../lib/jwtAuth');

const router = require('express').Router();
const Message = require('../models/Message');

//Add

router.post('/', jwtAuth, async (req, res, next) => {
	const { conversationId, sender, text } = req.body;
	const newMessage = new Message({ conversationId, sender, text });
	console.log(req.body);
	//console.log('nuevo mensage', newMessage);

	try {
		const saveMessage = await newMessage.save();
		console.log(saveMessage);
		res.status(200).json(saveMessage);
	} catch (err) {
		res.status(500).json(err);
		next(err);
	}
});

router.get('/:conversationId', jwtAuth, async (req, res, next) => {
	try {
		console.log(req.params);
		const messages = await Message.find({
			conversationId: req.params.conversationId,
		});
		res.status(200).json(messages);
	} catch (err) {
		res.status(500).json(err);
		next(err);
	}
});

module.exports = router;
