/**
 * A static utilities class, used to get/create objects and subscribe to events and a few other functions. Note that many classess require the utilities class.
 * @class utils
 * @static
*/

PR2.utils = (function(){
	// set attributes for an element, returns nothing
    var _setAttributes = function(el, attrs) {
		for(var key in attrs) {
			if (attrs[key] == "") {
				continue;
			}
			if (key == 'html') {
				el.innerHTML = attrs[key];
			}
			else {
				el.setAttribute(key, attrs[key]);
			}
		}
    };
	
	// set styles for an element, returns nothing
    var _setStyles = function(element, styles) {
		for(var key in styles) {
			element.style[key] = styles[key];
		}
    };
	 
	return {
		/**
		 * Gives a reference to a HTML element
		 * @method get
		 * @param id {String} the id of the element
		 * @return {HTMLElement}
		 */
		get : document.getElementById.bind(document),
		/**
		 * Creates a new HTML element and appends it to a specified element
		 * @method create
		 * @param tagname {String} the element tagname
		 * @param parent {HTMLElement} the element to which the new element will be appended
		 * @param [attributes] {Object} html element atributes defined as key/value pairs, can be null to skip
		 * @param [styles] {Object} element style properties defined as key/value pairs
		 * @return {HTMLElement}
		 */
		create : function(tagname, parent, attributes, styles) {
			var element = document.createElement(tagname);
			
			if (typeof parent == 'object') {
				parent.appendChild(element);
			}
			else {
				document.getElementById(parent).appendChild(element);
			}
			if (typeof attributes == 'object') {
				_setAttributes(element, attributes);
			}
			if (typeof styles == 'object') {
				_setStyles(element, styles);
			}		
			return element;
		},
		/**
		 * Gives the *computed* css property of a html element
		 * @method css_value
		 * @param element {HTMLElement} the HTML element to query for
		 * @param property {String} the css property name to query for
		 * @return {String} the value of the computed css value
		 */
		css_value : function(element, property) {
			return window.getComputedStyle(element).getPropertyValue(property); 			
		},
		/**
		 * Logs messages
		 * @method log
		 * @param event_type {String} can be 'note', 'warning' or 'error'
		 * @param message {String} the notification message
		 */
		log : function(event_type, message) {
			console.log(event_type + ": " + message);		
		},
		/**
		 * Method to subscribe to create multiple event handlers, basically a shorthand for mutiple 'document.addEventListener' calls
		 * @method subscribe
		 * @param element {HTMLElement} the element that fires the event(s)
		 * @param handlers {Object} an object that contains pairs of HTML element events (keys) and their callbacks, for example:
		 * @example	PR2.utils.subscribe(some_element, {'click' : function(e){ console.log(e.target + ' was clicked');}});
		 */
		subscribe : function(element, handlers) { 
			for (event_type in handlers) {
				
				element.addEventListener(event_type, handlers[event_type]);
			}
		},
		/**
		 * Method to check if a value is present in an array
		 * @method inArray
		 * @param value {any type} the value to check for
		 * @param array {array} the array to check against
		 */
		inArray : function(value, array) {
			return array.indexOf(value) == -1 ? false : true;
		},
		/**
		 * Method to set multiple css styles to an HTML element
		 * @method css
		 * @param element {HTMLElement} the element which to apply the css styles to
		 * @param styles {Object} an object that contains pairs of css properties and their respective css values
		 * @example	PR2.utils.css(div_element, {'color' : 'red'})
		 */
		css : _setStyles
	
	}
})();