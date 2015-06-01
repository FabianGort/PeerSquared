

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser')
var path = require('path');

var PR2    = require('./public/script/PR2.js').PR2;
var Pusher = require('./public/script/Pusher_Socket.js').Pusher;

var setup  = require('./public/script/setup.js').setup;
var config = require('./public/script/config').config;

var camplayer  = require('./public/script/PR2_modules/camplayer.js').camplayer;
var utils      = require('./public/script/PR2_modules/utils.js').utils;
var chatbox    = require('./public/script/PR2_modules/chatbox.js').chatbox;
var download   = require('./public/script/PR2_modules/download.js').download;
var fullscreen = require('./public/script/PR2_modules/fullscreen.js').fullscreen;
var modals     = require('./public/script/PR2_modules/modals.js').modals;
var peer       = require('./public/script/PR2_modules/peer.js').peer;
var shapes     = require('./public/script/PR2_modules/shapes.js').shapes;
var shortcuts  = require('./public/script/PR2_modules/shortcuts.js').shortcuts;
var toolbar    = require('./public/script/PR2_modules/toolbar.js').toolbar;
var upload     = require('./public/script/PR2_modules/upload.js').upload;
var user       = require('./public/script/PR2_modules/user.js').user;
var whiteboard = require('./public/script/PR2_modules/whiteboard.js').whiteboard;


//app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.sockets.on('connection', function (socket) {
    socket.on('join room', function(data){
        // check for SHA-1 string
        if(data.room.match(/^[A-Za-z0-9]{40}$/) == null) {
            socket.emit('user error', {error: 'invalid room', message:
'The server will disconnect now'});
            socket.disconnect();
        }
        else if(io.sockets.clients(data.room).length > 2){
            socket.emit('user error', {error: 'too many users', message:
'The server will disconnect now'});
            socket.disconnect();
        }
        else {
            socket.room = data.room;
            socket.join(socket.room);
            socket.emit('user joined', {user_count:
io.sockets.clients(socket.room).length, user: 'current'});
            socket.broadcast.to(socket.room).emit('user joined',
{user_count: io.sockets.clients(socket.room).length, user: 'other'});
        }
    }).on('disconnect', function(data){
      socket.broadcast.to(socket.room).emit('user left', {data: 'left'});
    }).on('webrtc', function(data) {
//    if(socket.room == data.room) {
            socket.broadcast.to(socket.room).emit('webrtc', data);
//    }
    });
});
