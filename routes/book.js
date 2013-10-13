
/*
 * GET Book data.
 */

var book = require('../models/book_model.js');
var BookModel = book.model;

exports.list = function(req, res){
  return BookModel.find(function (err, books) {
    console.log(books);
    if (!err) {
      return res.jsonp({ books: books, empty: false });
    } else {
      return res.jsonp({ empty: true });
    }
  });
};

exports.restore = function(req, res){
  return BookModel.findById(req.params.id, function (err, book) {
    console.log(book);
    if (!err) {
      return res.jsonp(book);
    } else {
      return res.jsonp(false);
    }
  });
};

exports.save = function(req, res){
  //return BookModel.findById({_id: req.params.id}, function (err, book) {
  return BookModel.findById(req.params.id, function (err, book) {
    console.log(book);
    book.last_page = req.body.last_page;
    return book.save(function (err) {
      if (!err) {
        return res.jsonp({ success: true });
      } else {
        return res.jsonp({ success: false });
      }
    });
  });
};

exports.remove = function(req, res){
  return BookModel.find(req.params.id, function (err, book) {
    // book = book[0];
    // book.last_page = req.body.last_page;
    // return book.save(function (err) {
    //   if (!err) {
    //     return res.jsonp({ success: true });
    //   } else {
    //     return res.jsonp({ success: false });
    //   }
    // });
  });
};

exports.add = function(req, res){
  var book = new BookModel({
    title: req.body.title,  
    file_name: req.body.file_name,
    last_page: 0
  });
  book.save(function (err) {
    if (!err) {
      return console.log("Book added");
    } else {
      return console.log(err);
    }
  });
  return res.send(book);
};