
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , book = require('./routes/book')
  , note = require('./routes/note')
  , http = require('http')
  , path = require('path')
  , cors = require('./cors');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  // app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(cors);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// BOOK
// app.get('/', routes.index);
app.all('/book/:id', cors);
app.all('/note', cors);

app.get('/books', book.list);
app.get('/book/:id', book.restore);
app.put('/book/:id', book.save);
app.delete('/book/:id', book.remove);
app.post('/book', book.add);

// NOTE
app.get('/book/:id/:page', note.fetchNotes);
app.post('/note', note.addNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
