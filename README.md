# PeerSquared

1)  npm install socket.io

2) npm install fs 

node server





**Note: this is an older version, I'm not providing support for this currently**

[PeerSquared](http://www.peersquared.info) is a free and easy to use tool for one-on-one online teaching. The teacher has a whiteboard to draw, write text, and put pictures on to explain a subject to a student. It also includes both video and text chat, as well as an option for direct file exchange. 


The updated version is modular: it is split into independent objects which are tied together by event handlers. See the [API documentation](http://www.peersquared.info/v1/apidocs/).

New in this version are also:
- redo actions
- paste screenshots onto the whiteboard
- synchronize the whiteboard

## HTML5 & PeerConnection (webRTC)
PeerSquared makes use of the fresh and still experimental PeerConnection technology, which is part of the HTML5 spec. It requires so-called reliable datachannels, which are currently only built into Firefox 22 and higher. Chrome does support the PeerConnection, but currently no reliable datachannels. For more info see the [webRTC website](http://www.webrtc.org/)

## Demonstration
For a demonstration see:

[Teacher](http://www.peersquared.info/v1/#teacher_test)

[Student](http://www.peersquared.info/v1/#student_test)

## License
PeerSquared currently uses a MIT license, so you are free to copy, use and modify it. 

## Installing it
You will need a websocket server to use PeerSquared, since the PeerConnection needs to exchange some information through a server. See the [script/Pusher_Socket.js](https://github.com/FabianGort/PeerSquared/blob/master/script/Pusher_Socket.js) for a demo version of how to connect to a websocket server. 

As you can see in the index.html file you will need to initialize the program by calling 'PR2.init()' which takes an object as argument. This object contains a "credentials" object , and optionally a "config" object that overwrites the initial configuration. The credentials must contain a user name, a room name, and a level (either student or teacher), so like this:

"credentials"  : {"name" : name, "level", level, "room" : room}




 
