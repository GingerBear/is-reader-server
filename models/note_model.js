var db = require('../config/db.js');
var Schema = db.schema;  

var Note = new Schema({
    user_id: { type: String, required: true },  
    book_id: { type: String, required: true },  
    page: { type: Number, required: true }, 
    position: { type: String, required: true },  // format: first_div,last_div,first_offset,last_offset
    is_hightlight: { type: Boolean, required: true },  
    notes: { type: String, required: false }
});
exports.model = db.mongoose.model('note', Note);