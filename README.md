# PeerSquared
[PeerSquared](http://www.peersquared.info) is a free and easy to use tool for one-on-one online teaching. The teacher has a whiteboard to draw, write text, and put pictures on and the student will see it all happening. It also includes both video and text chat, as well as an option for direct file exchange. 

## HTML5 & PeerConnection
PeerSquared makes use of the fresh and still experimental PeerConnection technology, which is part of the HTML5 spec. It requires so-called reliable datachannels, which are currently only built into Firefox 22 and higher. Chrome does does support PeerConnections, but currently no datachannels.

## Demonstration
For a demonstration see [here](http://www.peersquared.info/index.php)

## License
PeerSquared currently uses a MIT license, so you are free to copy, use and modify it. 

## Installing it
You will need a websocket server to be to use PeerSquared, since the PeerConnection needs to exchange some information through a server. See the [script/Pusher_Socket.js](https://github.com/FabianGort/PeerSquared/blob/master/script/Pusher_Socket.js) for a demo version of using a websocket server. 

As you can see in the index.html file you will need to initialize the program by calling 'PR2.init()' which takes an object as argument. This object contains a "credentials" object , and optionally a "config" object that overwrites the initial configuration. The credentials must contain a user name, a room name, and a level (either student or teacher), so like this:

"credentials"  : {"name" : name, "level", level, "room" : room}




 
