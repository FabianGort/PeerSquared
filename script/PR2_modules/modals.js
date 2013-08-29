PR2 = window.PR2 || {};

/**
 * A static class to show various types of modals to a user
 * @class modals
 * @static
 * @requires utils
*/

PR2.modals = (function(self) {
	var $ = PR2.utils;
 
	var modal_background = $.create('div', document.body, {"id" : "pr2_modal_background"}),
	
	info_modal = $.create('div', document.body, {"id" : "pr2_info_modal"}),
	info_message = $.create('div',info_modal, {"id" : "pr2_info_message"}),	
	help_modal = $.create('div', document.body, {"id" : "pr2_help_modal"}),
	help_modal_close = $.create('div', document.body, {"id" : "pr2_help_modal_close"});
	help_modal_close.addEventListener('click', function() { self.help('hide'); });
 
	// reference for a confirm callback function
	var _confirmed = null;
	
	// create the confirm dialog
	var confirm_modal = $.create("div", document.body, {"id" : "pr2_confirm_modal"});
	var confirm_modal_question = $.create("div", confirm_modal, {"id" : "pr2_confirm_question"});			 

	// YES button
	var confirm_modal_yes = $.create("button", confirm_modal, {"id" : "pr2_confirm_yes", "html": "Yes"});
	confirm_modal_yes.addEventListener('click', function(e){
		_confirmed();
		_confirmed = null;
		modal_background.style.display = 'none';
		confirm_modal.style.display = 'none';				
	});
	
	// CANCEL button
	var confirm_button_cancel = $.create("button", confirm_modal, {"id" : "pr2_confirm_cancel", "html" : "Cancel"});
	confirm_button_cancel.addEventListener('click', function(e){
		_confirmed = null;
		modal_background.style.display = 'none';
		confirm_modal.style.display = 'none';
	});
 
	self = {
		/**
		 * Displays a dialog, with a question that requires confirmation
		 * @method confirm
		 * @param message {string} the question text
		 * @param callback {function} function that is called when the user confirms
		 */
		confirm : function(message, callback) {
			modal_background.style.display = 'block';
			confirm_modal.style.display = 'block';
			confirm_modal_question.textContent = message;
			_confirmed = callback;			
		},
		/**
		 * Displays an information dialog with a message to the user
		 * @method info
		 * @param display {string} either 'show' or 'hide'
		 * @param message {string} the message text (only relevant when showed)
		 */
		info : function(display, message) {
			if (display == 'show') {
				modal_background.style.display = 'block';
				info_message.textContent = message;
				info_modal.style.display = 'block';
			}
			else if (display == 'hide') {
				modal_background.style.display = 'none';
				info_modal.style.display = 'none';
			}
		},
		/**
		 * Displays a dialog, and embeds a help file
		 * @method help
		 * @param display {string} either 'show' or 'hide'
		 * @param url {string} url that point to the help file
		 */
		help : function(display, url) {
			var request;
			if(display == "hide") {
				modal_background.style.display = 'none';				
				help_modal.style.display = 'none';
				help_modal_close.style.display = 'none';
				document.location.hash = '';
			}
			else if(display == "show") {
				modal_background.style.display = 'block';				
				help_modal.style.display = 'block';
				help_modal_close.style.display = 'block';
				request = new XMLHttpRequest();
				request.open('GET', url);
				request.responseType = 'document';
				request.onload = function(e) {  
					if(this.responseXML.documentElement.tagName == 'parsererror') {
						console.log("There was an error loading the content");
						help_modal.innerHTML = "There was an error loading the content";						
						return;
					}
					help_modal.innerHTML = this.responseXML.documentElement.innerHTML;
					help_modal.scrollTop = 0;
				};
				request.onerror = function(e) {
					console.log(e.currentTarget.response);
				}
				request.send(null);
			}			
		},
		/**
		 * Displays a notification dialog (Not yet implemented)
		 * @method alert
		 * @param message {string} the message to display
		 */
		alert : function(message) {
			// not implemented yet
		}
	}
	
	return self;
})(PR2.modals);