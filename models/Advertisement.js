'use strict';

const { query } = require('express');
const mongoose = require('mongoose');

//Schema

const advertisementSchema = mongoose.Schema({
	name: { type: String, index: true },
	sale: { type: Boolean, index: true },
	price: { type: Number, index: true },
	image: String,
	tags: { type: [String], index: true },
});

//methods

//metohod lista
advertisementSchema.statics.list = function (
	filter,
	limit,
	skip,
	fields,
	sort
) {
	const query = Advertisement.find(filter);
	query.limit(limit);
	query.skip(skip);
	query.select(fields);
	query.sort(sort);
	return query.exec();
};

advertisementSchema.statics.tagsList = function () {
	const queryTags = Advertisement.find();
	queryTags.distinct('tags');
	return queryTags.exec();
};
/*
advertisementSchema.methods.sold = function() {
    this.sale = true;
    return this.save();
}
*/
const Advertisement = mongoose.model('Advertisement', advertisementSchema);
module.exports = Advertisement;
