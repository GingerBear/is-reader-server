var db = require('../config/db.js');
var Schema = db.schema;  

var UserBook = new Schema({
    user_id: { type: String, required: true },  
    book_id: { type: String, required: true },  
    last_page: { type: Number, required: true }
});

exports.model = db.mongoose.model('userBook', UserBook, 'userBook');