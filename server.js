

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser')
var path = require('path');

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
