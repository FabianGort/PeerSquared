/**
 * A static upload class
 * @class upload
 * @static
 * @requires PR2.utils
*/
PR2.upload = (function(){
	var $ = PR2.utils,
		file_list = {}, // a collection of files, with their meta information, like name and size, and also a reference so it can be read by a FileReader, the keys are the file ID's
		file_queue = [], // a collection of files that are waiting to be uploaded
		current_file = null,  chunk_size = 10000,
		extension_blacklist = ['exe', 'com', 'vb', 'vbs', 'vbe', 'cmd', 'bat', 'ws', 'wsf', 'scr', 'shs', 'pif', 'hta', 'jar', 'js', 'jse', 'lnk', 'dll'],
		offer_create_handler = function() {},
		offer_accept_handler = function() {},
		offer_revoke_handler = function() {},
		offer_decline_handler = function() {},
		file_start_handler = function() {},
		file_cancel_handler = function() {},
		file_progress_handler = function() {},
		file_complete_handler = function() {};

 
	// start sending the next file if there is no current_file file being sent and the file_queue is not empty
	var _tryUploadNextFile = function () {
		if(current_file == null && file_queue.length > 0) { _sendFile(file_queue.shift()); }
	};
	
	// create an offer with a unique id, and add it to the file list
 	var _createOffer = function(file) {	
		var file_id = Date.now().toString().slice(-12) + '-' + Math.random().toString().slice(-12);

		file_list[file_id] = file;
		offer_create_handler(file_id, file.name); 
	};
	
	// if declined remove the file from the list
	var _declineOffer = function(file_id) {
		if(file_list.hasOwnProperty(file_id)) {
			offer_decline_handler(file_id, file_list[file_id].name);
			delete file_list[file_id];
		}
		else {
			throw new Error('invalid file id');
		}
	};
	
	// if accepted added the file id to the file queue, try to upload it
	var _acceptOffer = function(file_id) {
		if(file_list.hasOwnProperty(file_id)) {
			file_queue.push(file_id);
			_tryUploadNextFile();
			offer_accept_handler(file_id, file_list[file_id].name);
		}
		else {
			throw new Error('invalid file id');
		}
	};
	
	// if accepted added the file id to the file queue, try to upload it
	var _revokeOffer = function(file_id) {
		if(file_list.hasOwnProperty(file_id)) {
			offer_revoke_handler(file_id, file_list[file_id].name);
			delete file_list[file_id];
		}
		else {
			throw new Error('invalid file id');
		}		
	};
	
	// read the file that is the first in the file queue into memtory and start sending the meta data
	var _sendFile = function(file_id) {
		var reader = new FileReader;
		
		if(file_list.hasOwnProperty(file_id)) {
			current_file = file_list[file_id];
			reader.onload = function(e) {
				current_file.buffer = e.target.result;
				current_file.id = file_id;
				current_file.chunk_count = Math.ceil(current_file.buffer.byteLength / chunk_size);
				current_file.current_chunk = 0;
				file_start_handler(file_id, current_file.name, current_file.size, current_file.type, current_file.chunk_count);
				reader = null;
				_sendFileChunk();
			};
			reader.readAsArrayBuffer(current_file);
		}
	};
	
	// if the current file is canceled delete it from the list, and upload a new one
	var _cancelFile = function(source) {
		if (!$.inArray(source, ['local', 'remote'])) {
			throw new Error('this is not a valid source');
		}
		if (current_file != null) {
			file_cancel_handler(current_file.id, current_file.name, source);
			delete file_list[current_file.id];
			current_file = null;
	
			_tryUploadNextFile();	
		}
	};
	
	// send the next chunk of a file on request
	var _sendFileChunk = function() {
		var chunk_start, chunk_to_send, file_progress; 
		if(current_file == null) { return; }
		// calculate some file parameters
		chunk_start = current_file.current_chunk * chunk_size;
		chunk_to_send = current_file.buffer.slice(chunk_start, chunk_start + chunk_size);
		file_progress = Math.ceil((current_file.current_chunk / current_file.chunk_count) * 100);
		// fire the progress event
		file_progress_handler(current_file.id, chunk_to_send, file_progress);
		// if all the chunks are sent fire the complete event
		if(current_file.current_chunk == current_file.chunk_count) {
			file_complete_handler(current_file.id, current_file.name);
			current_file = null;
		} else {
			current_file.current_chunk++;
		}
	};

	return {
		/**
		 * Add files to the upload queue. Note that the files themselves aren't loaded, only their references. The files are loaded once an offer is accepted.
		 * Each added file fires an onOfferCreate event
		 * @method addFiles
		 * @param files {FileList} the list of files from for example the file input
		 */
		addFiles : function(files) {			
			for(var i = 0; i < files.length; i++) {
				if(extension_blacklist.indexOf(files[i].name.split('.').pop()) > -1) { $.log('warning', files[i].name + ' has a potentially dangerous extension and was therefore blocked'); return;}
				 _createOffer(files[i]);				
			}
		},
		/**
		 * Accept an offer to receive a file. When this method is called the upload will add the file to the send queue and try to send it. Fires the onOfferAccept event.
		 * @method acceptOffer
		 * @param file_id {String} id that is fired after the onOfferCreated event
		 */
		acceptOffer : function(file_id) { 
			_acceptOffer(file_id);
		},
		/**
		 * Decline an offer to receive a file. Fires the onOfferDecline event
		 * @method declineOffer
		 * @param file_id {String} id that is fired after the onOfferCreated event
		 */
		declineOffer : function(file_id) {
			_declineOffer(file_id);
		},
		/**
		 * Revoke a file offer. Fires the onOfferRevoke event
		 * @method revokeOffer
		 * @param file_id {String} id of the file to revoke
		 */
		revokeOffer : function(file_id) {
			_revokeOffer(file_id);
		},
		/**
		 * Cancel receiving the current file. This method is used to cancel both on the local and remote side. Fires the onFileCancel event
		 * @method cancelFile
		 * @param source {String} can be either 'local' or 'remote'
		 */
		cancelFile : function(source) {
			_cancelFile(file_id, source);
		},
		/**
		 * Inform the upload object that a file chunk was received. The upload object will then send a new chunk or a new file if the last
		 * chunk of a file was sent. Fires an onFileProgress event
		 * @method informChunkReceived
		 */		
		informChunkReceived : function() {
			if (current_file == null) {
				throw new Error('no chunk to send');
			}
			_sendFileChunk();
		},
		/**
		 * Inform the upload object that a file was succesfully received. The upload object will then fire the onFireComplete event and try to send a new file
		 * chunk of a file was sent. The upload will then fire the onFileProgress event.
		 * @method informFileComplete
		 */	
		informFileComplete : function() {
			_tryUploadNextFile();
		},
		/**
		 * Fires when an upload offer is created, one for reach file directly after a file is added
		 * @event onOfferCreate
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
		onOfferCreate : function(callback) {
			offer_create_handler = callback;
		},
		/**
		 * Fires when an upload offer is revoked by the uploader 
		 * @event onOfferRevoke
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
		onOfferRevoke : function(callback) {
			offer_revoke_handler = callback;
		},
		/**
		 * Fires when a file offer is declined
		 * @event onOfferDecline
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
		onOfferDecline : function(callback) {
			offer_decline_handler = callback;
		},
		/**
		 * Fires when a file offer is accepted
		 * @event onOfferAccept
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
		onOfferAccept : function(callback) {
			offer_accept_handler = callback;
		},
		/**
		 * Fires when a file chunk is sent
		 * @event onFileProgress
		 * @param id {String} id of the file
		 * @param chunk {ArrayBuffer} the next chunk to send
		 * @param progress {Number} a number between 0 and 100, indicating the progress of the file
		 */
		onFileProgress : function(callback) {
			file_progress_handler = callback;
		},
		/**
		 * Fires when a file upload is started
		 * @event onFileStart
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 * @param size {String} size of the file
		 * @param type {String} type of the file
		 * @param count {Number} number of file chunks that need to be transferred
		 */
		onFileStart : function(callback) {
			file_start_handler = callback;
		},
		/**
		 * Fires when the file upload is canceled
		 * @event onFileCancel
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 * @param source {String} the source that canceled the file ('local' or 'remote')
		 */
		onFileCancel : function(callback) {
			file_cancel_handler = callback;
		},
		/**
		 * Fires when a file is complete
		 * @event onFileComplete
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
		onFileComplete : function(callback) {
			file_complete_handler = callback;
		}
	};
})();