/* Object to exchange Peer connection meta data (sdp's and ice candidates), can be replaced by any other object that connects to a server to exchange peer data.
 * Only important factors are:
 * 1. When two users are connected through the server and ready to call: PR2.peer.usersConnected()
 * 2. When peer data is received call: PR2.peer.addPeerInfo()
 * */

var Socket = (function() {
	var connected  = false, channel, webSocket,
	users_connected_handler = function() {},
	message_received_handler = function(){};
	
	var _user_added = function() {
		if (channel.members.count == 2) {
			console.log('users are connected through a server');
			users_connected_handler();
		} 			
	};
	
	var _connected_to_server = function() {
		console.log('socket connection established');
		connected = true;
		_user_added();		
	};
	
	// listen for events: subscription, member added, incoming messages
	var create_listeners = function() {
		// listen for successful subscription, wait for other or connect if he's already present
		channel.bind('pusher:subscription_succeeded', _connected_to_server);	
		// listen for successful connection of the other to the server
		channel.bind('pusher:member_added', _user_added);	
		// listen for incoming client peer data and fire the event
		channel.bind('client-message', message_received_handler);
	};

	return {
		// Public methods
		// Open a websocket connection and create channel event listeners	
		open : function(room_name, user_name) {
			console.log('connecting user ' + user_name + ' to ' + 'channel ' + room_name);
			pusher_socket = new Pusher('3cf3c7ca0b7957dece97');
			Pusher.channel_auth_endpoint = 'auth.php?your_name=' + user_name ;
			channel = pusher_socket.subscribe('presence-' + room_name);
			create_listeners();
		},
		/* Send data to the other user through the websocket but only if 'connected' is true
		 * first parameter is a string denoting the information type; should be either 'ice' or 'sdp'
		 * second parameter is a data object, with the Peer Connection Data to exchange
		 */
		send : function(data) {
			if (!connected) {
				throw new Error('There is no connection with the websocket server');
			}
			else {
				channel.trigger('client-message', data);
			}
		},	
		// close the websocket connection		
		close : function() {
			if (connected) {
				connected = false;
				pusher_socket.disconnect();
				console.log('socket disconnected');		
			}
		},
		onMessage : function(callback) {
			message_received_handler = callback;
		},
		onUsersConnect : function(callback) {
			users_connected_handler = callback;
		}
	};
})();
