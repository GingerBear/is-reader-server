
/*
 * GET home page.
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://bbbear444:123qweasd@ds049898.mongolab.com:49898/is-reader');

var Schema = mongoose.Schema;  

var Book = new Schema({
    title: { type: String, required: true },  
    file_name: { type: String, required: true },  
    last_page: { type: Number, required: true }
});

var BookModel = mongoose.model('Book', Book);  

exports.list = function(req, res){
  return BookModel.find(function (err, books) {
    console.log(books);
    if (!err) {
      return res.jsonp({
        books: books,
        empty: false
      });
    } else {
      return res.jsonp({
        empty: true
      });
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
  return BookModel.find(req.params.id, function (err, book) {
    book = book[0];
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

exports.add = function(req, res){
  var book;
  console.log("ADD: ");
  book = new BookModel({
    title: "JavaScript Web Application",  
    file_name: "jwa.pdf",
    last_page: 12
  });
  book.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      return console.log(err);
    }
  });
  return res.send(book);
};