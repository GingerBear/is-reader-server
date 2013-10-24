
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
        res.cookie('rememberme', '1', { maxAge: 1000*60*60*24*30, httpOnly: false });
        res.cookie('user_id', users[0]._id.toString(), { maxAge: 1000*60*60*24*30, httpOnly: false });
        res.cookie('username', users[0].username, { maxAge: 1000*60*60*24*30, httpOnly: false });
        res.cookie('email', users[0].email, { maxAge: 1000*60*60*24*30, httpOnly: false });
        // res.session.rememberme = 1;
        // res.session.id = users[0]._id.toString();
        // res.session.username = users[0].username;
        // res.session.email = users[0].email;

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
      return user.save(function (err, user) {
        if (!err) {
          res.cookie('rememberme', '1', { maxAge: 1000*60*60*24*30, httpOnly: false });
          res.cookie('user_id', users._id+'', { maxAge: 1000*60*60*24*30, httpOnly: false });
          res.cookie('username', user.username, { maxAge: 1000*60*60*24*30, httpOnly: false });
          res.cookie('email', user.email, { maxAge: 1000*60*60*24*30, httpOnly: false });
          return res.jsonp({ success: true });
        } else {
          return res.jsonp({ success: false });
        }
      });
    }
  });
};