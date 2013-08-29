/**
 * A static download class
 * @class download
 * @static
 * @requires PR2.utils
*/
PR2.download = (function(){
     var $ = PR2.utils,
          file_list = {}, // a collection of files (meta information, and binary data)
          chunk_size = 10000,
          current_file = null,
          extension_blacklist = ['exe', 'com', 'vb', 'vbs', 'vbe', 'cmd', 'bat', 'ws', 'wsf', 'scr', 'shs', 'pif', 'hta', 'jar', 'js', 'jse', 'lnk', 'dll'],
          offer_receive_handler = function() {},
          offer_revoke_hanlder = function() {},
          offer_accept_handler = function() {},
          offer_decline_handler = function() {},
          file_start_handler = function() {},
          file_cancel_handler = function() {},
          file_progress_handler = function() {},
          file_complete_handler = function() {};

     var _receiveOffer = function(file_id, file_name) {
          if (typeof file_list[file_id] == 'undefined') {
               file_list[file_id] = {};
               file_list[file_id].id = file_id;
               file_list[file_id].name = file_name;
               offer_receive_handler(file_id, file_name);
          }
          else {
               throw new Error('duplicate file id');
          }
     };
     
     var _revokeOffer = function(file_id) {
          if(file_list.hasOwnProperty(file_id)) {
               offer_revoke_handler(file_id, file_list[file_id].name);
          }
     };
     
     var _declineOffer = function(file_id) {
          if(file_list.hasOwnProperty(file_id) && file_list[file_id] != current_file) {
               offer_decline_handler(file_id, file_list[file_id].name);
               delete file_list[file_id];
          }
          else {
              throw new Error('invalid file id');
          }
     };
     
     var _acceptOffer = function(file_id) {
          if(file_list.hasOwnProperty(file_id) && file_list[file_id] != current_file) {
               offer_accept_handler(file_id, file_list[file_id].name);
          }
          else {
               throw new Error('invalid file id');
          }
     };
     
     var _receiveFileMetaData = function(file_id, file_name, file_size, file_type, chunk_count) {
          if(file_list.hasOwnProperty(file_id) && file_list[file_id] != current_file) {
              current_file = file_list[file_id]; 
              current_file.id = file_id;
              current_file.current_chunk = 0;
              current_file.size = file_size;
              current_file.type = file_type;
              current_file.chunk_count = chunk_count;
              current_file.data = [];
              file_start_handler(file_id, current_file.name, current_file.size, current_file.type, current_file.chunk_count);
          }
          else {
               throw new Error('invalid file id');
          }
     };
     
     var _receiveFileChunk = function(chunk) {
          if(current_file == null) { throw new Error('invalid file id'); }
          current_file.data.push(chunk);
          current_file.current_chunk++;
          file_progress = Math.ceil((current_file.current_chunk / current_file.chunk_count) * 100); 
          // fire the progress event
          file_progress_handler(current_file.id, file_progress);

          // if all the chunks are sent fire the complete event
          if(current_file.current_chunk == current_file.chunk_count) {
              _finishFile();
          }
     };

     var _cancelFile = function(source) {
          if (!$.inArray(source, ['local', 'remote'])) {
              throw new Error('this is not a valid source');
          }
          file_cancel_handler(current_file.id, current_file.name, source);
          delete file_list[file_id];
          current_file = null;
     };
     
     var _finishFile = function() {
          var blob =  new Blob(current_file.data, { "type" : current_file.type }), object_url = URL.createObjectURL(blob);

          file_complete_handler(current_file.id, current_file.name, object_url);
          URL.revokeObjectURL(blob);
          current_file = null;        
     };

     return {
		/**
		 * Receive a file offer
		 * @method receiveOffer
		 * @param file_id {string} id of the file offer
		 * @param file_name {string} name of the file offer
		 */          
          receiveOffer : function(file_id, file_name) {            
               _receiveOffer(file_id, file_name);
          },
          /**
		 * Revoke a file offer. Fires the onOfferRevoke event
		 * @method revokeOffer
		 * @param file_id {string} id of the file offer
		 * @param file_name {string} name of the file offer
		 */        
          revokeOffer : function(file_id, file_name) {
               _revokeOffer(file_id, file_name);
          },
		/**
		 * Delcine a file offer. Fires the onOfferDecline event
		 * @method declineOffer
		 * @param file_id {string} id of the file
		 */      
          declineOffer : function(file_id) {
               _declineOffer(file_id);
          },
		/**
		 * Accept a file offer. Fires the onOfferAccept event
		 * @method acceptOffer
		 * @param file_id {string} id of the file offer
		 */     
          acceptOffer : function(file_id) {
               _acceptOffer(file_id);		
          },
		/**
		 * Receive the file meta data like size and type
		 * @method receiveFileMetaData
		 * @param file_id {string} id of the file 
		 * @param file_name {String} name of the file
		 * @param file_size {string} file size in bytes
		 * @param file_type {string} file type
		 * @param chunk_count {string} number of file chunks to transfer
		 */  
          receiveFileMetaData : function(file_id, file_name, file_size, file_type, chunk_count) {
               _receiveFileMetaData(file_id, file_name, file_size, file_type, chunk_count);
          },
		/**
		 * Receive a new file chunk
		 * @method receiveFileChunk
		 * @param chunk {ArrayBuffer}
		 */  
          receiveFileChunk : function(chunk) {
               _receiveFileChunk(chunk);
          },
		/**
		 * Cancel receiving the current file. This method is used to cancel both on the local and remote side. Fires the onFileCancel event
		 * @method cancelFile
		 * @param source {String} source that canceled the file, can be 'local' or 'remote'
		 */  
          cancelFile : function(source) {
               _cancelFile(source);
          },
		/**
		 * Fired when a file offer is received
		 * @event onOfferReceive
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
          onOfferReceive : function(callback) {
               offer_receive_handler = callback;
          },
		/**
		 * Fired when an offer is revoked
		 * @event onOfferRevoke
		 * @param file_id {String} the file id
		 * @param file_name {String} the name of the file
		 */
          onOfferRevoke : function(callback) {
               offer_revoke_handler = callback;
          },
		/**
		 * Fired when a file offer is accepted
		 * @event onOfferAccept
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
          onOfferAccept : function(callback) {
               offer_accept_handler = callback;
          },
		/**
		 * Fired when a file offer is declined
		 * @event onOfferDecline
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 */
          onOfferDecline : function(callback) {
               offer_decline_handler = callback;
          },
		/**
		 * Fired when a file download starts, intended to expose file meta data
		 * @event onFileStart
		 * @param file_id {String} the file id
		 * @param file_size {String} file size in bytes
		 * @param file_type {String} file type in bytes
		 * @param chunk_count {string} number of file chunks to transfer
		 */  
          onFileStart : function(callback) {
               file_start_handler = callback;
          },
		/**
		 * Fired when the file upload is canceled. Fires when both local and remote source cancel
		 * @event onFileCancel
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 * @param source {String} the source that canceled the file ('local' or 'remote')
		 */ 
          onFileCancel : function(callback) {
               file_cancel_handler = callback;
          },
		/**
		 * Fired when a file chunk is received
		 * @event onFileProgress
		 * @param id {String} id of the file
		 * @param progress {Number} a number between 0 and 100, indicating the progress of the file
		 */
          onFileProgress : function(callback) {
               file_progress_handler = callback;
          },
		/**
		 * Fired when a file is complete
		 * @event onFileComplete
		 * @param id {String} id of the file
		 * @param name {String} name of the file
		 * @param object_url {String} the object url of the finished file
		 */
          onFileComplete: function(callback) {
               file_complete_handler = callback;
          }
     }
})();