PR2 = window.PR2 || {};

/**
 * A very basic static class to bind keys with Ctrl to functions
 * @class shortcuts
 * @static
 * @requires shortuts
*/
PR2.shortcuts = (function(self) {
	var $ = PR2.utils, shortcuts = [], ignore_keys = [86];
	$.subscribe(window, {'keydown' : function(e) {
		if(e.ctrlKey && ignore_keys.indexOf(e.keyCode) == -1) {			
			for (var i = 0, len = shortcuts.length; i < len; i++) {
				if (e.keyCode == shortcuts[i].key) {
					e.preventDefault();
					shortcuts[i].action();
				}
			}
		}
	}});
	
	self = {
		/**
		 * Method to bind keys to functions
		 * @method add
		 * @param shortcut_object {object} an object that contains keys and their corresponding actions, like this:
		 * @example	{{"key": 80, "action": function() { console.log('a key was pressed'); }},"key": 90, "action": function() { console.log('another key was pressed'); }}}
		 */
		add : function(shortcut_object) {
			if (typeof shortcut_object == 'object') {
				shortcuts.push(shortcut_object);
			}
		}
	}
	return self;
})(PR2.shortcuts);