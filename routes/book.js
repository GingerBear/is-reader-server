
/*
 * GET Book data.
 */

var book = require('../models/book_model.js');
var user = require('../models/user_model.js');
var user_book = require('../models/user_book_model.js');
var BookModel = book.model;
var UserModel = user.model;
var UserBookModel = user_book.model;

exports.listUserBook = function(req, res){
    console.log(req.cookies);
    console.log(req.cookies.id);
  return UserBookModel.find({user_id: req.cookies.id}, function (err, user_books) {
    console.log(user_books);
    var book_ids = [];
    for (var i = user_books.length - 1; i >= 0; i--) {
      book_ids.push(user_books[i].book_id);
    };
    if (!err) {
      return BookModel.find({_id: {$in: book_ids}}, function (err, books) {
        console.log(books);
        if (!err) {
          return res.jsonp({ books: books, empty: false });
        } else {
          return res.jsonp({ empty: true });
        }
      });
    } else {
      return res.jsonp({ empty: true });
    }
  });
};

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
    if (!err) {
      return UserBookModel.find({book_id: book._id, user_id: req.cookies.id}, function (err, userBook) {
        book.last_page = userBook[0].last_page;
        if (!err) {
          return res.jsonp(book);
        } else {
          return res.jsonp(false);
        }
      });
    } else {
      return res.jsonp({ empty: true });
    }
  });
};

exports.save = function(req, res){
  return UserBookModel.findOne({book_id: req.params.id, user_id: req.cookies.id}, function (err, user_book) {
    console.log(user_book);
    user_book.last_page = req.body.last_page;
    return user_book.save(function (err) {
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