PR2 = window.PR2 || {};

/**
 * A simple static class that serves as a polyfill for the different browser implementations of the HTML5 fullscreen API
 * @class fullscreen
 * @static
*/

PR2.fullscreen = (function(self) {
	var	$ = PR2.utils,
		_fullscreen_handler =function(){},
		_current,
		_request, _cancel; 

		
	if (document.cancelFullscreen) {
		window.addEventListener('fullscreenchange', function() {
			_fullscreen_handler(document.mozFullScreenElement);
		});
 
		_current = function() { return document.fullscreenElement; },
		_request = function(element) { element.requestFullscreen();  },
		_cancel = function() { document.cancelFullscreen();  },
		_onFullscreenChange = function(callback) { _fullscreen_handler = callback;}
 
	}
	else if (document.mozCancelFullScreen) {
		window.addEventListener('mozfullscreenchange', function() {
			_fullscreen_handler(document.mozFullScreenElement);
		});
		_current = function() { return document.mozFullScreenElement; },
		_request = function(element) { element.mozRequestFullScreen(); },
		_cancel = function() { document.mozCancelFullScreen(); },
		_onFullscreenChange = function(callback) { _fullscreen_handler = callback;}
	}
	else if (document.webkitCancelFullScreen) {
		window.addEventListener('webkitfullscreenchange', function() {
			_fullscreen_handler(document.mozFullScreenElement);
		});
		_current = function() { return document.webkitFullScreenElement; },
		_request = function(element) { element.webkitRequestFullscreen(); },
		_cancel = function() { document.webkitCancelFullScreen(); },
		_onFullscreenChange = function(callback) { _fullscreen_handler = callback;}
	}
	
	return {
		/**
		 * Returns the current fullscreen element
		 * @method current
		 * @return {HTMLElement} The element that is fullscreen (null if not in fullscreen mode)
		 */
		current : _current,
		/**
		 * Requests fullscreen on an element
		 * @method request
		 * @param id {String} the id of the element, if no id is given the body element requests fullscreen access
		 */
		request : function(element) {
			if (typeof element == 'string') {
				element = $.get(element);
			}
			else {
				element = document.body;
			}
			_request(element);
		},
		/**
		 * Cancels the fullscreen mode and restores the normal state
		 * @method cancel
		 */
		cancel : _cancel,
		/**
		 * Fired when the fullscreen element changes
		 * @event onFullscreenChange
		 * @param {HTMLElement} The element that is fullscreen (null if not in fullscreen mode)
		 */
		onFullscreenChange :_onFullscreenChange
	};
})(PR2.fullscreen);