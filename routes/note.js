
/*
 * GET Note data.
 */

var note = require('../models/note_model.js');
var NoteModel = note.model;

exports.addNote = function(req, res){
  var note = new NoteModel({
    user_id: req.cookies.user_id,
    book_id: req.body.book_id,
    page: req.body.page,
    position: req.body.position,
    is_mark: req.body.is_mark,
    is_private: req.body.is_private,
    note: req.body.note
  });
  note.save(function (err) {
    if (!err) {
      return console.log("Note added");
    } else {
      return console.log(err);
    }
  });
  return res.send(note);
};

exports.fetchNotes = function(req, res){
  return NoteModel.find({book_id: req.params.id, page: req.params.page, user_id: req.cookies.user_id}, function (err, notes) {
    //console.log(notes);
    if (!err) {
      return res.json(notes);
    } else {
      return res.json(false);
    }
  });
};

exports.fetchNoteList = function(req, res){
  console.log(req);
  return NoteModel.find({book_id: req.params.id, user_id: req.cookies.user_id}, function (err, notes) {    console.log(notes);
  console.log(notes);
    if (!err) {
      return res.json(notes);
    } else {
      return res.json(false);
    }
  });
};