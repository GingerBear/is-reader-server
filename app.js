
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
  app.use(express.static(path.join(__dirname, 'public')));
  // app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser('my secret here'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(cors);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// static page
app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.get('/index.html', function (req, res) {
    res.sendfile(filedir + '/index.html');
});
app.get('/reader.html', function (req, res) {
    res.sendfile(filedir + '/reader.html');
});


// BOOK
// app.get('/', routes.index);
app.all('/book/:id', cors);
app.all('/note', cors);

app.get('/books', book.listUserBook);
app.get('/book/:id', book.restore);
app.put('/book/:id', book.save);
app.delete('/book/:id', book.remove);
app.post('/book', book.add);

// NOTE
app.get('/book/:id/:page', note.fetchNotes);
app.post('/note', note.addNote);

// USER
app.post('/user/signup', user.signup);
app.post('/user/login', user.login);
//app.post('/user', user.addNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
