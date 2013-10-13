var mongoose = require('mongoose');
mongoose.connect('mongodb://bbbear444:123qweasd@ds049898.mongolab.com:49898/is-reader');
//mongoose.connect('mongodb://localhost/is_reader');
exports.mongoose = mongoose;
exports.schema = mongoose.Schema;