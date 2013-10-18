
/*
 * GET Book data.
 */

var user = require('../models/user_model.js');
var UserModel = user.model;

exports.login = function(req, res){
  var email    = req.body.email;
  var password = req.body.password;
  return UserModel.find({email: email, password: password}, function (err, users) {
    console.log(users);
    if (!err) {
      if (users.length > 0) {
        res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: false });
        res.cookie('id', users[0]._id.toString(), { maxAge: 900000, httpOnly: false });
        res.cookie('username', users[0].username, { maxAge: 900000, httpOnly: false });
        res.cookie('email', users[0].email, { maxAge: 900000, httpOnly: false });
        return res.jsonp({ success: true, cookie: true });
      } else {
        return res.jsonp({ success: false });
      }
    } else {
      return res.jsonp({ success: false });
    }
  });
};

exports.signup = function(req, res){
  var username    = req.body.username;
  var email    = req.body.email;
  var password = req.body.password;
  return UserModel.find({email: email}, function (err, users) {
    console.log(users);
    if (users.length > 0) {
      return res.jsonp({ success: false, msg: "exist" });
    }else{
      var user = new UserModel({
        username: username,  
        email: email,  
        password: password,
      });
      return user.save(function (err) {
        if (!err) {
          return res.jsonp({ success: true });
        } else {
          return res.jsonp({ success: false });
        }
      });
    }
  });
};