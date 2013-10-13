var db = require('../config/db.js');
var Schema = db.schema;  

var Book = new Schema({
    title: { type: String, required: true },  
    file_name: { type: String, required: true },  
    last_page: { type: Number, required: true }
});

exports.model = db.mongoose.model('book', Book);