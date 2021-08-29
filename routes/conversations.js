'use strict';
const jwtAuth = require('../lib/jwtAuth');

const router = require('express').Router();
const Conversation = require('../models/Conversation');

// new Conversation
/*********************************IN USE********************************/
router.post('/', jwtAuth, async (req, res, next) => {
	//console.log(req.body);
	const { advertisementId, senderId, receiverId } = req.body;
	const newConversation = new Conversation({
		advertisementId,
		members: [senderId, receiverId],
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
/***************************IN USE***************************/
//router.get('/:userId/:advertisementId', async (req, res, next) => {

router.get('/userConversations/:userId', jwtAuth, async (req, res, next) => {
	try {
		const userId = req.params.userId;
		//console.log('userId', userId);
		const conversation = await Conversation.find({
			members: { $in: [userId] },
		});
		//console.log('userConversations', conversation);
		res.status(200).json(conversation);
	} catch (err) {
		next(err);
	}
});
/*****************************IN USE*********************************/
//for speakers in conversation for know who is online
router.get('/users/:userId', jwtAuth, async (req, res, next) => {
	try {
		const userId = req.params.userId;
		console.log('userId', userId);
		const users = await Conversation.find({
			members: { $in: [userId] },
		}).populate({ path: 'members' });
		console.log('Array de users', users);
		let speakers = users.map((user) => {
			console.log('user in map', user.members);
			return user.members.find((member) => member !== userId);
		});
		console.log(
			'linea 49 conversations.js en speakers para usuarios conectados',
			speakers
		);
		const speakersUniques = new Set(speakers);
		let result = [...speakersUniques];
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
});

router.get('/:userId/:advertisementId', jwtAuth, async (req, res, next) => {
	try {
		//console.log('userid', req.params);
		const { userId, advertisementId } = req.params;
		const conversation = await Conversation.find({
			advertisementId,
			members: { $in: [userId] },
			//members: { $in: [req.params.userId] },
			//BUSCAR COMO FILTRAR POR DOS CAMPOS LISTA ANUNCIOS advertisements.js
		}).populate({ path: 'advertisementId' });
		res.status(200).json(conversation);
	} catch (err) {
		next(err);
		//return res.status(500).json(err);
	}
});
/**************************IN USE******************************/
//get all conversations for advertisement of user connected
router.get('/:userId', jwtAuth, async (req, res, next) => {
	try {
		//console.log('userid', req.params);
		const { userId } = req.params;
		const conversation = await Conversation.find({
			members: { $in: [userId] },
			//members: { $in: [req.params.userId] },
			//BUSCAR COMO FILTRAR POR DOS CAMPOS LISTA ANUNCIOS advertisements.js
		})
			.populate({ path: 'advertisementId' })
			.populate({ path: 'members' });
		res.status(200).json(conversation);
	} catch (err) {
		next(err);
		//return res.status(500).json(err);
	}
});

module.exports = router;
