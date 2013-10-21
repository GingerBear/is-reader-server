
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
  , cors = require('./cors')
  , fs = require('fs');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser('neil secret'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(cors);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  if (req.cookies.rememberme) {
    res.redirect('books'); 
  }else{
    res.redirect('login'); 
  }
});

app.get('/books', function(req, res){
  if (req.cookies.rememberme) {
    res.render('books'); 
  }else{
    res.redirect('logout'); 
  }
});

app.get('/login', function(req, res){
  if (req.cookies.rememberme) {
    res.redirect('books'); 
  }else{
    res.render('login'); 
  }
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/logout', function(req, res){
  // destroy session
  for (var key in req.cookies) {
    if (typeof req.cookies[key] !== 'function')
      res.cookie(key, '', { maxAge: -900000, httpOnly: false });
  };
  res.redirect('/login');
});

app.get('/reader', function(req, res){
  res.render('reader');
});

app.post('/upload', function(req, res){
  var i = 1
    , len = Object.keys(req.files).length;
  for (var key in req.files) {
    // save pdf 
    if (req.files[key].type === 'application/pdf') {
      (function(file, i, len){
        fs.readFile(file.path, function (err, data) {
          if (!err) {            
            var fileName = Date.now() + ".pdf";
            // for windows
            //var newPath = __dirname + "\\public\\data\\pdf\\" + fileName;
            // for linux
            var newPath = __dirname + "/public/data/pdf/" + fileName;
            fs.writeFile(newPath, data, function (err) {
              if (!err) {
                console.log(file.name.split('.')[0] +" :: "+ fileName);
                book.addBook(file.name.split('.')[0], fileName, function(id) {
                  book.addUserBook(req.cookies.user_id, id, function() {
                    if (i === len) {
                      return res.json({ success: true });
                    }
                    console.log(i + 'th file saved');                
                  });
                });
              } else {
                console.log(i + 'th file save error: ' + err);
              }
            });
          } else  {
            console.log('read file error: ' + err);
            return res.json({ success: false });
          }
        });
      })(req.files[key], i, len)
    }    
    i += 1;
  };
});


// BOOK
app.all('/book/:id', cors);
app.all('/note', cors);

app.get('/book_list', book.listUserBook);
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
