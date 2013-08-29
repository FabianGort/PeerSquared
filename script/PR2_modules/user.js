PR2 = window.PR2 || {};

/**
 * A static class to store and retrieve user credentials, that is name and level (student/teacher) as well as role (creator/observer).
 * @class user
 * @static
 * @requires utils
*/
PR2.user = (function(self){
	var $ = PR2.utils,
	user_credentials = {},
	role_change_handler = function(){},
	user_role;

	var _setCredentials = function(credentials) {
		if (typeof credentials != 'object') {
			throw new Error('No credentials were provided');
		}
		else if (!$.inArray(credentials.level, ['teacher', 'student'])) {
			throw new Error('Level must be teacher or student');
		}
		else if (typeof(credentials.name) != 'string') {
			throw new Error('User name must be of type string');
		}
		else if (typeof(credentials.channel) != 'string') {
			throw new Error('Channel name must be of type string');
		}
		else {
			user_credentials = credentials;
		}
	};
	
	var _setRole = function(role) {
		if (!$.inArray(role, ['creator', 'observer'])) {
			throw new Error('This is not a valid role');
		}
		user_role = role;
		role_change_handler(role);		
	};
	
	self = {
		/**
		 * Returns the user credendtials
		 * @method getCredentials
		 * @return {object} credentials with keys 'name' and 'level' (level can be 'teacher' or 'student')
		 */
		getCredentials : function() {
			return Object.create(user_credentials)
		},
		/**
		 * Returns the user role
		 * @method getRole
		 * @return {string} user role, either 'creator' or 'observer'
		 */
		getRole : function() {
			return user_role;
		},
		/**
		 * Set the user credentials
		 * @method setCredentials
		 * @param role {Object} (object containing the level ('teacher' or 'student') and name of the participant
		 * @return this {Object} the object itself for chaining
		 */
		setCredentials : function(credentials) {
			_setCredentials(credentials);
			return self;
		},
		/**
		 * Sets the user role
		 * @method setRole
		 * @param role {string} (either 'creator' or 'observer')
		 * @return this {Object} the object itself for chaining
		 */
		setRole : function(role) {
			_setRole(role);
			return self;
		},
		/**
		 * Fired when the user role changes
		 * @event onRoleChange
		 * @param {string} user role, either 'creator' or 'observer'
		 */
		onRoleChange : function(callback) {
			if (typeof callback != 'function') {
				throw new Error('This is not a function');
			}
			role_change_handler = callback;
		}
	}
	
	return self;
})(PR2.user);