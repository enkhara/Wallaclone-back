'use strict';

const router = require('express').Router();
const Conversation = require('../models/Conversation');

// new Conversation

router.post('/', async (req, res, next) => {
	console.log(req.body);
	const newConversation = new Conversation({
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

router.get('/:userId', async (res, req, next) => {
	try {
		console.log('userid', req.params);
		const userId = req.params.userId;
		const conversation = await Conversation.find({
			members: { $in: [req.params.userId] },
		});
		res.status(200).json(conversation);
	} catch (err) {
		next(err);
		//return res.status(500).json(err);
	}
});

// router.get('/', async function (req, res, next) {
// 	try {
// 		const resultado = await Conversation.find();
// 		res.json(resultado);
// 	} catch (err) {
// 		next(err);
// 	}
// });

module.exports = router;
