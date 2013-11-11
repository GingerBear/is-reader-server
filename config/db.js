var mongoose = require('mongoose');
//mongoose.connect('mongodb://bbbear444:123qweasd@gxding.com/is-reader');
//mongoose.connect('mongodb://bbbear444:123qweasd@gxding.com/is-reader');
mongoose.connect('mongodb://localhost/is-reader');
exports.mongoose = mongoose;
exports.schema = mongoose.Schema;