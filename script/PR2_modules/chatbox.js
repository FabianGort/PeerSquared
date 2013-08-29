/**
 * A static class that displays a chatbox with text field, and file picker. It can be used to display messages (including emoticons) and file transfers.
 * @class chatbox
 * @static
 * @requires utils
*/
PR2.chatbox = (function(self){
	var $ = PR2.utils,
		enabled = true,
		file_add_handler = function(){},
		link_click_handler = function(){},
		message_add_handler = function() {},
		container = $.create('div', document.body, {"id" : "pr2_chat_container"}),
		dialog = $.create('div', container, {"id" : "pr2_chat_conversation"}),
		input = $.create('textarea', container, {"id" : "pr2_chat_input"}),
		button_box = $.create('span', container),
		file_button = $.create('button', button_box, {"id" : "pr2_file_send_button"}),
 		send_button = $.create('button', button_box, {"id" : "pr2_chat_send_button"},{"opacity" : "0.5"}),
		file_picker = $.create('input', document.body, {"type" : "file", "multiple" : "true"}, {"display" : "none"});

	var _addFileOffer = function(id, filename, offerer) {
		var file_field = $.create('div', dialog), progress_field = $.create('div', dialog);

		if (!enabled) { return; }
		
		if (offerer == 'local') {
			file_field.innerHTML = '<span>you:</span><span id="file-' + id + '"><a data-action="revoke-offer" href="#">cancel</a> ' + filename + '</span>';
		}
		else if (offerer == 'remote') {
			file_field.innerHTML = '<span class="pr2_chat_other">other:</span><span id="file-' + id + '"><a data-action="decline-offer" href="#">decline</a> | <a data-action="accept-offer" href="#">accept</a> ' + filename + '</span>';	
		}
		progress_field.innerHTML = '<span></span><span><progress value="0" max="100" id="progr-' + id + '"></progress></span>';		
	};
	 
	var _toggleStatus = function(action) {
		if (action == 'enable') {
			enabled = true;
			container.style.opacity = "1";
			input.disabled = false;
			send_button.disabled = false;
			send_button.style.cursor = 'pointer'; 
		}
		else if(action == 'disable') {
			enabled = false;
			container.style.opacity = "0.4";
			input.disabled = true;
			send_button.disabled = true;
			send_button.style.cursor = 'default'; 
		}		
	};
	
	var _parse_message = function (message) {
		var emos = [[":-?\\)", "smile"], ["8-\\|", "nerd"], [";-?\\)", "wink"], ["\\*-?\\)", "think"]],
			url_regex = new RegExp("((https?:\/\/)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])", "gi");
		// replace emoticon codes for emoticons
		emos.forEach(function(item){
			message = message.replace(new RegExp(item[0], "gi"), '<span class="pr2_emo pr2_emo_' + item[1] + '"></span>');
		});
		// return message with URL's replaced
		return message.replace(url_regex, "<a href='$1' target='_blank'>$1</a>");
	};
 
	var _addMyMessage = function() {
		var message = input.value.trim();
		_addMessage("local", message);
		message_add_handler(message);
		input.value = "";
	};
	
	var _addMessage = function(source, message) {
		var message_wrapper, owner;

		if (!enabled || message == "" || message.length == 0 || typeof message != 'string') {
			return; 
		}
		message_wrapper = document.createElement('div');
		if(source == 'remote') {
			message_wrapper.classList.add('pr2_chat_other');
			owner = 'Other';
		}
		else {
			owner = 'You';
		}
		message_wrapper.innerHTML = "<span>" + owner + ":</span><span>" + _parse_message(message) + "</span>";
		dialog.appendChild(message_wrapper);
		dialog.scrollTop = dialog.scrollHeight - parseInt(window.getComputedStyle(dialog).getPropertyValue('height').slice(0,-2),10);			
	};
	
	var _updateFileStatus = function(id, name, status, object_url) {
		var html;
		
		if (!enabled) { return; }
		
		switch (status) {
			case 'downloading' :
				html = "downloading " + name + " <a href='#' action-data='cancel-download'>cancel</a>";
				break;
			case "uploading" :
				html = "uploading " + name + " <a href='#' action-data='cancel-upload'>cancel</a>";
				break;
			case "upload-waiting" :
				html = name + " is waiting <a href='#' action-data='cancel-upload'>cancel</a>";				
				break;
			case "download-waiting" :
				html = name + " is waiting <a href='#' action-data='cancel-upload'>cancel</a>";				
				break;
			case "upload-completed" :
				html = name + " upload complete";
				break;
			case "download-completed" :
				html = "<a href='" + object_url + "' download='" + name + "'>" + name + "</a> is complete";
				break;
			case "download-canceled" :
				html = "Other canceled " + name;
				break;
			case "upload-canceled" :
				html = "You canceled " + name;
				break;
	
		}
		$.get('file-' + id).innerHTML = html;
		dialog.scrollTop = dialog.scrollHeight - parseInt(window.getComputedStyle(dialog).getPropertyValue('height').slice(0,-2),10);	
	};
	
	var _updateFileProgress = function(file_id, file_progress) {

	$.get('progr-' + file_id).value = file_progress;	
	};
	
	$.subscribe(file_button, {
		'click' : function() {
			file_picker.click();
		}
	});
	
	$.subscribe(file_picker, {
		'change' : function(e){
			file_add_handler(e.target.files);
		}
	});
	
	$.subscribe(input, {
		'keydown' : function(e){
			if (enabled && e.keyCode === 13 && e.ctrlKey && this.value.length > 0)	{
				_addMyMessage();
			}
		},
		'keyup' : function(e) {
			if (this.value.length > 0) {
				send_button.style.opacity = 1;
			}
			else {
				send_button.style.opacity = 0.5;
			}			
		},
		'dragover' : function(e) {
			e.preventDefault();
		},
		'drop' : function(e) {
			file_add_handler(e.dataTransfer.files);
			e.preventDefault();
		}
	});			
	
	$.subscribe(send_button, {
		'click' : function() {
			_addMyMessage();	
		}	
	});
	
	$.subscribe(dialog, {
		'click' : function(e) {
			var id, el = e.target;
			if (el.tagName.toLowerCase() == 'a' && typeof el.dataset.action != 'undefined') {
				e.preventDefault();
				link_click_handler(el.dataset.action, el.parentElement.id.substring(5));
			}
		}
	});
	
	self = {
		/**
		 * Method to add a message to the conversation box. Fires the onMessageAdd event
		 * @method addMessage
		 * @param source {string} can be 'local' for the local or 'remote' for the remote user 
		 * @param message {string} the message to add
		 */
		addMessage : function(source, message) {
			_addMessage(source, message);
		},
		/**
		 * Method to add a file offer to the conversation box.
		 * @method addFileOffer
		 * @param file_id {string} a unique id to identify the file
		 * @param file_name {string} the name of the file
		 * @param source {string} can be 'local' for the local or 'remote' for the remote user 
		 */
		addFileOffer : function(file_id, file_name, source) {
			_addFileOffer(file_id, file_name, source);
		},
		/**
		 * Method to update the status of a file in the conversation box.
		 * @method updateFileStatus
		 * @param file_id {string} a unique id to identify the file
		 * @param file_name {string} the name of the file
		 * @param status {string} can be one of the following values: 'download-waiting', 'upload-waiting', 'downloading', 'uploading', 'download-completed', 'upload-completed', 'download-canceled' or 'upload-canceled'
		 * @param [object_url] {string} an object url which is only required when a download is complete, in other words the status is 'download-complete'
		 */
		updateFileStatus : function(file_id, file_name, status, object_url) {
			_updateFileStatus(file_id, file_name, status, object_url);
		},
		/**
		 * Method to update the progress of a file in the conversation box.
		 * @method updateFileProgress
		 * @param file_id {string} a unique id to identify the file
		 * @param file_progress {number} between 0 and 100, indicating the progress
		 */
		updateFileProgress : function (file_id, file_progress) {
			_updateFileProgress(file_id, file_progress);
		},
		/**
		 * Method to toggle the active state of the chatbox
		 * @method toggleStatus
		 * @param status {string} either 'enable' to enable it, or 'disable' to disable it
		 */
		toggleStatus : function(status) {
			_toggleStatus(status);
		},
		/**
		 * Fired when a *local* message is added to the chatbox
		 * @event onMessageAdd
		 * @param message {string} the message that was added
		 */
		onMessageAdd : function(callback) {
			message_add_handler = callback;
		},
		/**
		 * Fired when files are added to the chatbox. Note that more files can be added at the same time, but the event fires only once, outputting a file list
		 * @event onFilesAdd
		 * @param file_id {fileList} a list of files
		 */
		onFilesAdd : function(callback) {
			if (typeof callback == 'function') {
				file_add_handler = callback;
			}
		},
		/**
		 * Fired when a link is clicked. Note that this only applies to upload and download links to exchange file transfer information. Regular links are ignored.
		 * @event onLinkClicked
		 * @param action {string} the type of action of the clicked link, can be 'cancel-offer', 'decline-offer', 'accept-offer' 'cancel-upload' or 'cancel-download'
		 * @param file_id {string} the unique file id
		 */
		onLinkClicked : function(callback) {
			if (typeof callback == 'function') {
				link_click_handler = callback;
			}			
		}
	}
	return self;

})(PR2.chatbox);