/* This Socket singleton object can be replaced any another Socket object, as long as it implements the following three public methods:
 *	open(room_name, user_name)
 *	send(data_type, data_object)
 *	close()
 *	
 *	The methode ared called by PR2. Every time a member is added to a Socket 'room', it must call PR2.peer.onMemberAdded(number_of_members_in_room)
 *	As soon as there are two people in the room the PR2.peer object will then initialize the PeerConnections and exchange data by calling Socket.send(data_type, data_object).
 *	After the exchange the websocket is closed, by calling Socket.close()  
 */

var Socket = (function() {
	var connected  = false, wsChannel, webSocket ;
	
	// listen for events: subscription, member added, incoming messages
	var _listeners = function() {
		// listen for successful subscription, wait for other or connect if he's already present
		wsChannel.bind('pusher:subscription_succeeded', function(members) {
			console.log('socket connection established');
			connected = true; 		
			PR2.peer.onMemberAdded(members.count); 		
		});
		
		// listen for successful adding of other member
		wsChannel.bind('pusher:member_added', function() { 		
			PR2.peer.onMemberAdded(wsChannel.members.count); 	
		});
		
		// listen for incoming messages
		wsChannel.bind('client-message', function(evt) {
			if (evt.type == 'sdp') {
				PR2.peer.onRemoteDataChannelSDP(evt.data); 
			}
			// ice is not implemented yet
			/*
			else if (evt.type == 'ice') {
				//PR2.peer.setRemoteIceCandidate(evt.data);
			}
			*/
		});		
	};

	return {	// Public methods
  
		/* Open a websocket connection
		 * If user waiting for the other party: PR2.peer.waitForClient();
		 * If both users are connected:  PR2.peer.onClientSocket();
		 * Also make sure to set 'connected' to true once there is a connection with the websocket server
		 */
		
		open : function(room_name, user_name) {
			console.log('connecting user ' + user_name + ' to ' + 'channel ' + room_name);
			pusher_socket = new Pusher('ce5e15ae4b2ea6d71902');
			Pusher.channel_auth_endpoint = 'auth.php?your_name=' + user_name ;
			wsChannel = pusher_socket.subscribe('presence-' + room_name);
			_listeners();
		},
		
		/* Send data to the other user through the websocket but only if 'connected' is true
		 * first parameter is a string denoting the information type; should be either 'ice' or 'sdp'
		 * second parameter is a data object, with the Peer Connection Data to exchange
		 */
		
		send : function(type, data) {
			if (!connected) {
				throw new Error('There is no connection with the websocket server');
			}
			else if (['ice', 'sdp'].indexOf(type) < 0) {
				throw new Error('No valid type');
			}
			else {
				wsChannel.trigger('client-message', {"type" : type, "data" : data});
			}
		},
		
		// close the websocket connection		
		close : function() {
			if (connected) {
				pusher_socket.disconnect();
				console.log('socket disconnected');		
			}
		}
	};
})();