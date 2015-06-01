var http = require('http'),
     socket_io = require('socket.io'),
     fs = require('fs');
    
    //var options = {};
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var path = require('path');

//app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//app.use(express.static(path.join(__dirname, 'public')));


var app = http.createServer(handler);
var io = socket_io.listen(app);


app.listen(3000);

/*
io.configure(function () {
io.set("origins","fabfactory.cloud.tilaa.com:*|localhost:*|developer.cdn.mozilla.net:*|www.fabfactory.eu:*|fabfactory.eu:*|developer.mozilla.org:*|www.peersquared.info:*|peersquared.info:*|localhost:*");
});

*/
function handler (req, res) {
     fs.readFile(__dirname + '/index.html',
         function (err, data) {

             if (err) {
                 res.writeHead(500);
                 return res.end('Error loading index.html');
             }
             res.writeHead(200);
             res.end(data);
         });
}

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
