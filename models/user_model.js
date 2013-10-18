var db = require('../config/db.js');
var Schema = db.schema;  

var User = new Schema({
    username: { type: String, required: true },  
    email: { type: String, required: true },  
    password: { type: String, required: true }
});

exports.model = db.mongoose.model('user', User);