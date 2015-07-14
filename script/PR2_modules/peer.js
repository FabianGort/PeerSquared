/**
 * A static class to exchange peer data, through streams and data channels. Also serves as a polyfill for the different browser implementations of the PeerConnection object (the latter is not implemented, only FF support at the moment)
 * @class peer
 * @static
 * @requires utils
*/
PR2.peer = (function() {
	var $ = PR2.utils,
		PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
		IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate,
		SessionDescription = window.mozRTCSessionDescription; window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription,
		servers = {},
		options = {},
		starter = false, // will be set to for the peer that starts the connection
		dataPC = null, myCamPC = null, otherCamPC = null,
		whiteboard_data_channel = null, // channel for whiteboard data exchange
		peer_info_data_channel = null,  // channel for peer information exchange
		file_data_channel = null, // channel for file exchange
		common_data_channel = null, // channel to send stringyfied objects
		connected = false,
		local_stream = null,
		remote_stream = null,
		connection_handler = function() {},
		peer_info_handler = function() {},
		whiteboard_data_handler = function() {},
		common_data_handler = function() {},
		file_data_handler = function() {},
		remote_stream_handler = function() {},
		close_handler = function() {};
		
		var _init = function() {
			dataPC = mozRTCPeerConnection(); //PeerConnection(servers, options);
			dataPC.ondatachannel = _datachannel_created; 
			myCamPC = mozRTCPeerConnection(); // PeerConnection(servers, options);
			otherCamPC = mozRTCPeerConnection(); // PeerConnection(servers, options);
			otherCamPC.onaddstream = _on_remote_stream; 
			$.log('info', 'Peer objects are initialized');
		};
		// note that this datachannels is intented for exchange of peer connection data, but the primary peer data is exchanged through a server!
		var _connect = function() {
			starter = true;
			peer_info_data_channel = dataPC.createDataChannel('peer_info_data_channel', {reliable : true});
			peer_info_data_channel.onopen = _peer_info_data_channel_open;
			peer_info_data_channel.onmessage = _peer_info_data_channel_message; 
			dataPC.createOffer(_offerCreated, error);
			$.log('info', 'Peer connection is created');
		};
		
		
		var _offerCreated = function(sdp) {
			dataPC.setLocalDescription(sdp);
			$.log('info', 'Offer is created and description set/sent');
			peer_info_handler('sdp', sdp);
		};
		
		var _answerCreated = function(sdp) {
			dataPC.setLocalDescription(sdp);
			$.log('info', 'Answer is created and description set/sent');
			peer_info_handler('sdp', sdp);
		};
		
		// add session descriptions 
		var _addPeerInfo = function(type, data) {
			if (type == 'sdp') {
				dataPC.setRemoteDescription(SessionDescription(data));
				// create an answer to an offer and add an event handler for datachannel creation
				if (data.type == 'offer') {
					dataPC.createAnswer(_answerCreated, error);		
				}
			}
			else if (type == 'ice') {
				// not implemented yet
			}
		};
		
		// method to assign handlers to datachannels
		var _datachannel_created = function(e) {
			var channel = e.channel;
			switch (channel.label) {
				case 'peer_info_data_channel' :
					peer_info_data_channel = e.channel;
					peer_info_data_channel.onopen = _peer_info_data_channel_open;
					peer_info_data_channel.onmessage = _peer_info_data_channel_message;		
					break;
				case 'common_data_channel' :
					common_data_channel = e.channel;
					common_data_channel.onmessage = _common_data_channel_message;
					break;
				case 'file_data_channel' :
					file_data_channel = e.channel;
					file_data_channel.onmessage = _file_data_channel_message;
					break;
				case 'whiteboard_data_channel' :
					whiteboard_data_channel = e.channel;
					whiteboard_data_channel.onmessage = _whiteboard_data_channel_message;
					break;
			}

		};
		// message handlers
		var _peer_info_data_channel_message = function(e) {
			var data = JSON.parse(e.data);
			
			switch (data.type) {
				case 'cam-offer' :
					otherCamPC.setRemoteDescription(new SessionDescription(data.sdp));
					otherCamPC.createAnswer(_streamAnswerCreated, error);
					break;
				case 'cam-answer' :
					myCamPC.setRemoteDescription(new SessionDescription(data.sdp));
					break;
			}
		};
		
		var _file_data_channel_message = function(e) {
			file_data_handler(e.data);
		};
		
		var _common_data_channel_message = function(e) {
			common_data_handler(JSON.parse(e.data));
		};

		var _whiteboard_data_channel_message = function(e) {
			whiteboard_data_handler(JSON.parse(e.data));
		};
		// the first channel to open, this allows for creation of the other channels
		var _peer_info_data_channel_open = function(e) {
			connected = true;
			connection_handler();
			if (starter) { // create the other datachannels
				file_data_channel = dataPC.createDataChannel('file_data_channel', {reliable :true});
				file_data_channel.onmessage = _file_data_channel_message;
				whiteboard_data_channel = dataPC.createDataChannel('whiteboard_data_channel', {reliable : true});
				whiteboard_data_channel.onmessage = _whiteboard_data_channel_message;
				common_data_channel = dataPC.createDataChannel('common_data_channel', {reliable : true});
				common_data_channel.onmessage = _common_data_channel_message;
			}
			
		};
		
		var error = function(error) {
			$.log('error', error.message);
		};
		// send file data
		var _sendFileData = function(data) {
			file_data_channel.send(data);				
		};
		// send common data
		var _sendData = function(data) {
			common_data_channel.send(JSON.stringify(data));	
		};
		// send whiteboard data
		var _sendWhiteboardData = function(data) {
			whiteboard_data_channel.send(JSON.stringify(data));	
		};

		// add a local stream
		var _addStream = function(stream) {
			if (!connected) {
				throw new Error('There is no Peer Connection');
			}
			myCamPC.addStream(stream);
			local_stream = stream;
			myCamPC.createOffer(_streamOfferCreated, error);
		};
		
		var _streamOfferCreated = function(sdp) {
			myCamPC.setLocalDescription(sdp);
			peer_info_data_channel.send(JSON.stringify({type : 'cam-offer', sdp : sdp}));
		};
		
		var _streamAnswerCreated = function(sdp) {
			otherCamPC.setLocalDescription(sdp);
			peer_info_data_channel.send(JSON.stringify({type : 'cam-answer', sdp : sdp}));
		};
		
		var _on_remote_stream = function(e) {
			remote_stream_handler(e.stream);
		};
		
 	return {
		/**
		 * Initialize Peer Connections
		 * @method init
		 * @param servers {Object} an object that contains a list if STUN serveers
		 * @param options {Object} an object with configuration options
		 */
		init : function(server, options) {
			_init();
		},
		/**
		 * Establish a connection between the peers. Normally one of the Peers would initialize the connection.
		 * through this connection. Normally one of the Peers would initialize the connection
		 * @method connect
		 * @param servers {Object} an object that contains a list if STUN serveers
		 * @param options {Object} an object with configuration options
		 */
		connect : function() {
			_connect();
		},
		/**
		 * add a media stream to broadcast
		 * @method addStream
		 * @param stream {MediaStream} a stream from a webam or other media stream resource
		 */
		addStream : function(stream) {
			_addStream(stream);
		},
		/**
		 * If there is Peer information (sdp or ice) add it to the Peer Connection
		 * @method addPeerInfo
		 * @param type {String} the type of information, either 'sdp' or 'ice'
		 * @param {Object} object that holds the peer information
		 */
		addPeerInfo : function(type, data) {
			_addPeerInfo(type, data);
		},
		/**
		 * Informs if there is a Peer Connection
		 * @method isConnected
		 * @return {Boolean} true if connected, and fals if not
		 */
		isConnected : function() {
			return connected;
		},
		/**
		 * Send data to the other peer. This is meant for stringified objects. ArrayBuffer data should be sent through 'sendFileData'
		 * @method sendData
		 * @param data {Stringified object} the stringified object that contains the data to send
		 */
		sendData : function(data) {
			_sendData(data);
		},
		/**
		 * Send file data to the other peer
		 * @method sendFileData
		 * @param chunk {ArrayBuffer} chunks of a file
		 */
		sendFileData : function(file_chunk) {
			_sendFileData(file_chunk);
		},
		/**
		 * Send whiteboard data to the other peer
		 * @method sendWhiteboardData
		 * @param {Object} whiteboard actions
		 */
		sendWhiteboardData : function(data) {
			_sendWhiteboardData(data);
		},
		/**
		 * Fired when there is a connection between the peers (that is when the first data channel between them is opened)
		 * @event onConnection
		 */
		onConnection : function(callback) {
			connection_handler = callback;
		},
		/**
		 * Fired when peer information becomes available (sdp or ice)
		 * @event onPeerInformation
		 * @param type {String} the type of information (sdp or ice)
		 * @param info {String} the information itself
		 */
		onPeerInfo : function(callback) {
			peer_info_handler = callback;
		},
		/**
		 * Fired when the connection is closed
		 * @event onClose
		 */
		onClose : function(callback) {
			close_handler = callback;
		},
		/**
		 * Fired when common data (stringified object) is received
		 * @method onData
		 * @param {String} a *stringified* object
		 */
		onData : function(callback) {
			common_data_handler = callback;
		},
		/**
		 * Fired when file data is received
		 * @event onFileData
		 * @param {ArrayBuffer} a file chunk
		 */
		onFileData : function(callback) {
			file_data_handler = callback;		
		},
		/**
		 * Fired when whiteboard data is received
		 * @event onWhiteboardData
		 * @param {Object} a whiteboard action
		 */
		onWhiteboardData : function(callback) {
			whiteboard_data_handler = callback;			
		},
		/**
		 * Fired when a remote stream arrives
		 * @event onRemoteStream
		 * @param {Stream} the stream that was added
		 */
		onRemoteStream : function(callback) {
			remote_stream_handler = callback;
		}
	};
	
})();
