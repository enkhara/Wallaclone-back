'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
	{
		advertisementId: { type: String, ref: 'Advertisement', index: true },
		members: {
			type: Array,
			ref: 'User',
			index: true,
		},
	},
	{ timestamps: true }
);

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
