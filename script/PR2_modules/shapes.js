/**
 * A static class to get, remove and add shape objects to  a collection. Note that a shape object constist of the following:
 * the key is the name of the shape by convention, the value is another object which contains: the following keys:title, style and shapeFunction
 * @class shapes
 * @static
*/
PR2.shapes = (function(self) {	
	var _collection = {}, _add_shape_handler = function(){}, _remove_shape_handler = function(){} ;
	
	var _add = function(shape_object) {
		var shape = Object.keys(shape_object)[0]; 
		_collection[shape] = shape_object[shape];
		_add_shape_handler([shape]);		
	};
	
	var _addMultiple = function(shape_object_collection){
		var shapes = [];
		for (shape_object in shape_object_collection) {
			if (shape_object_collection.hasOwnProperty(shape_object)) {
				_collection[shape_object] = shape_object_collection[shape_object];
				shapes.push(shape_object);
			}	 
		}
		_add_shape_handler(shapes);		
	};
	
	_get = function(shape) {
		if (typeof _collection[shape] == 'undefined') { throw new Error('This shape does not exist'); }
		return _collection[shape];		
	};
	
	_getAll = function() {
		return Object.create(_collection);
	};
	_remove = function(shape) {
		if (typeof _collection[shape] == 'undefined') { throw new Error('This shape does not exist'); }
		delete _collection[shape];
		_remove_shape_handler([shape]);		
	};
	
	self = {
		/**
		 * Add a shape to 
		 * @param shape_object {Object} the object with information about the shape. 
		 */
		add : function(shape_object) {
			_add(shape_object);
		},
		/**
		 * Add a collection (which is an object itself) of shapes to the internal shape collection
		 * @method addMultiple
		 * @param shape_object_collection {Object}  
		 */
		addMultiple : function(shape_object_collection) {
			_addMultiple(shape_object_collection);
		},
		/**
		 * Get a shape object from the collection
		 * @method get
		 * @param shape {String} the name (key) that represents the shape to be retrieved
		 * @return {Object} an object with the information about a shape
		 */
		get : function(shape) {
			return _get(shape);
		},
		/**
		 * Get all the shapes from the collection
		 * @method getAll
		 * @return {Object} an object with a collection of shape objects
		 */
		getAll : function() {
			return _getAll();
		},
		/**
		 * Remove a shape from the collection
		 * @method remove
		 * @param shape {Array} array that contains the name of the shape to be removed
		 */
		remove : function(shape) {			
			_remove(shape);
		},
		/**
		 * Fired when a shape is added
		 * @event onAdd
		 * @param shapes {Array} an array that contains the names of the shapes that where added
		 */
		onAdd : function(callback) {
			if (typeof callback != 'function') {
				throw new Error('This is not a function');
			}
			_add_shape_handler = callback;
		},
		/**
		 * Fired when a shape is removed
		 * @event onRemove
		 * @param shape {String} the name of the shape that was removed
		 */
		onRemove : function(callback) {
			if (typeof callback != 'function') {
				throw new Error('This is not a function');
			}
			remove_shape_handler = callback;
		}			
	};
	
	return self;

})(PR2.shapes);