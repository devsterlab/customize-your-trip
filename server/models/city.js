var mongoose = require('../lib/mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	timezone: {
		type: String,
		required: true
	},
	bounds: {
		type: Schema.Types.Mixed,
		required: true
	}
});

module.exports = {
	schema,
	model: mongoose.model('City', schema)
};