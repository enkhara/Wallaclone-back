'use strict';

const router = require('express').Router();
const Conversation = require('../models/Conversation');

// new Conversation

router.post('/', async (req, res, next) => {
	console.log(req.body);
	const newConversation = new Conversation({
		advertisementId: req.body.advertisementId,
		members: [req.body.senderId, req.body.receiverId],
	});

	try {
		const savedConversation = await newConversation.save();
		res.status(200).json(savedConversation);
	} catch (err) {
		next(err);
		//return res.status(500).json(err);
	}
});

//get conversation of a user

router.get('/:userId/:advertisementId', async (req, res, next) => {
	try {
		console.log('userid', req.params);
		const { userId, advertisementId } = req.params;
		const conversation = await Conversation.find({
			advertisementId: advertisementId,
			members: { $in: [req.params.userId] },
			//BUSCAR COMO FILTRAR POR DOS CAMPOS LISTA ANUNCIOS advertisements.js
		}).populate({ path: 'advertisementId' });;
		res.status(200).json(conversation);
	} catch (err) {
		next(err);
		//return res.status(500).json(err);
	}
});

module.exports = router;
