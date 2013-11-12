var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/is-reader');
exports.mongoose = mongoose;
exports.schema = mongoose.Schema;