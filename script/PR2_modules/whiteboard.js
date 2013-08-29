PR2 = window.PR2 || {};

/**
 * A static class that represents the whiteboard, the most important PR2 object. 
 * @class whiteboard
 * @static
 * @requires utils
*/ 
PR2.whiteboard = (function(self) {
	var $ = PR2.utils,
	action_change_handler = function() {},
	property_change_handler = function() {},
	pointer_action_handler = function() {},
	config = {lineWidth : 1,strokeStyle: 'black', lineCap : 'round', lineJoin : 'round', background : ""}, 
	mouse_down = false,
	image_add_target = "",
	access = false,
	current_action, 
	shapeFunction, 
	drag_element = null, // the element that is being dragged, if any
	resize_element = null, // the element that is being resized, if any
	dropped_image = false // check if there is an editable image on the canvas


	// create a container for the whiteboard layers
	var container = $.create('div', document.body, {"id" : "pr2_canvas_container"});
	
	// create canvas	
	var canvas = $.create("canvas", container, {"id" : "pr2_canvas", "class" : "pr2_canvas"});
	var ctx = canvas.getContext("2d");    
	
	// create upper temporary canvas
	var temp_canvas = $.create("canvas", container, {"id" : "pr2_temp_canvas", "class" : "pr2_canvas"});		
	var temp_ctx = temp_canvas.getContext("2d");
	
	var download_link = $.create("a", document.body , {"id" : "pr2_download_link", "download": "canvas.png", "target" : "_blank"}, {"display" : "none"});
	var file_picker = $.create("input", document.body , {"id" : "pr2_file_picker", "type": "file", "accept" : "image/*"}, {"display" : "none"});
	var paste_buffer = $.create('div', document.body, {"contenteditable" : "true"},{"overflow": "hidden", "max-height" : 0, "max-width" : 0, "opacity" : "hidden"});
 
	var remote_pointer = $.create('div', document.body, {"id" : "pr2_remote_pointer"}, {"backgroundImage" : "url(icons/pointer.png)"});
	
	var _setDimensions = function(height, width) {
		config.height = canvas.height = temp_canvas.height = height; 
 		config.width = canvas.width = temp_canvas.width = width;
		$.css($.get('pr2_right_layer'), {'left' : (canvas.offsetLeft + canvas.offsetWidth) + 'px'});
		$.css($.get('pr2_bottom_layer'), {'top' : (canvas.offsetTop + canvas.offsetHeight) + 'px'});
		_setProperty('lineWidth', config.lineWidth);
		_setProperty('strokeStyle', config.strokeStyle);
		_setProperty('lineCap', config.lineCap);
		_setProperty('lineJoin', config.lineJoin);
		_getOffset();
		_repaintWhiteboard();
	}
	
	var _loadActions = function(data) {
		store.replace(data);
		_repaintWhiteboard();
	};
	
	var _getProperty = function(property) {
		if (!$.inArray(property, ['action', 'shape', 'strokeStyle', 'lineWidth', 'fontFamily', 'fontSize', 'lineJoin', 'lineCap', 'background'])) {
			throw new Error('Invalid property: ' + property);
		}		

		if (property != 'background') {
			return config[property];
		}
		else {
			return canvas.style.backgroundImage;
		}
	};
	
	var _setProperty = function(property, value) {
		if (!$.inArray(property, ['action', 'shape', 'strokeStyle', 'lineWidth', 'fontFamily', 'fontSize', 'lineJoin', 'lineCap', 'background'])) {
			throw new Error('Invalid property: ' + property);
		}
		
		if (property != 'background') {
			config[property] = value;
		}

		if (property == 'shape') {
			shapeFunction = PR2.shapes.get(value).shapeFunction;
			property_change_handler('shape', value);
		}
		else if (property == "action") { 
			if (!$.inArray(value, ['paint', 'point', 'shape', 'write', 'none'])) { 
				throw new Error(property + ' is not a valid action');
			}
			if (!access) {
				temp_canvas.style.cursor = 'default';
			}
			else if (value == 'point') {
				temp_canvas.style.cursor = 'url(icons/pointer.png), move';
			}
			else if (value == 'write') {
				temp_canvas.style.cursor = 'text';
			}
			else if (value == 'none') {
				temp_canvas.style.cursor = 'default';
			}			
			else {
				temp_canvas.style.cursor = 'crosshair';
			}

				
			current_action = actions[value];
			text_editor.style.display = 'none';
			image_editor.style.display = 'none';
			property_change_handler('action', value);
		}
		else if($.inArray(property, ['lineWidth', 'strokeStyle', 'lineCap', 'lineJoin'])){
			ctx[property] = value; 
			temp_ctx[property] = value;
			text_editor.style.color = value;
			property_change_handler(property, value);
		}
		else if (property == 'fontFamily' || property == 'fontSize') {
			text_editor.style[property] = value;
			textheight_calculator.style[property] = value;
			text_editor.style.height = (textheight_calculator.scrollHeight) + 'px';
			property_change_handler(property, value);
		}
		else if (property == 'background') {
			canvas.style.backgroundImage = value;
			config[property] = value;  
			property_change_handler('background', value);
		}
	};
	
	var save_local = function(){
		var img = new Image(), url, link = $.get('pr2_download_link');	
		var save_img = document.createElement('canvas');
		var save_ctx = save_img.getContext('2d');
			save_img.height = config.height;
			save_img.width = config.width;
		
		if(canvas.style.backgroundImage == '') {
			save_ctx.fillStyle= "white";
			save_ctx.rect(0, 0, canvas.width, canvas.height);
			save_ctx.fill();
			canvasToImage();						
		}
		else {
			url = canvas.style.backgroundImage.slice(5,-2);
			img.onload = function() {
				var pattern = ctx.createPattern(img,"repeat");
				save_ctx.rect(0,0,canvas.width,canvas.height);
				save_ctx.fillStyle= pattern;
				save_ctx.fill();
				canvasToImage();
			}
			img.src = url;
		}

		function canvasToImage() {
			canvas.toBlob(function(blob) {
				var url = URL.createObjectURL(blob), img = new Image();  
				img.onload = function() {
					save_ctx.drawImage(img, 0, 0);
					saveImage();
				}
				img.src = url;	
			}, 'image/png'); 																	
		}
		   
		function saveImage() {
			save_img.toBlob(function(blob) {
				var link = $.get('pr2_download_link');
				link.href = URL.createObjectURL(blob);
				link.target ="_blank";
				link.click();
			 
			}, 'image/png');					 
	
		}
	};
	
	var _addAction = function(action) {
		switch (action.type) {
			case 'paint' : _paint(action.config, action.data); break;
			case 'image' : _image(action.data); break;
			case 'write' : _write(action.config, action.data); break;
			case 'shape' : _shape(action.config, action.data); break;
		}
		store.add(action.type, action.config, action.data);
	}

	var _paint = function(config, data) {
		ctx.strokeStyle = config.color;
		ctx.lineWidth = config.width;
		actions.paint('start', data[0][0], data[0][1]);
		for(var j = 0, len = data.length; j < len; j++) { 
			actions.paint('continue', data[j][0], data[j][1]);
		}	
	};
	
	var _image = function(data) {
		img = new Image();
		img.onload = function() {
			ctx.drawImage(img, data[0], data[1], data[2], data[3]);
		}
		img.src = data[4];		
	};
	
	var _write = function(config, data) {
		actions.writeComplete(data[0], data[1], data[2], data[3], "normal " + config.size + " " +  config.font, config.color, data[4]);		
	};
	
	var _shape = function(config, data) {
		ctx.strokeStyle = config.color;
		ctx.lineWidth = config.width;
		shapeFunction = PR2.shapes.get([config.shape]).shapeFunction;
		actions.shape('start', data[0][0], data[0][1]);
		actions.shape('end', data[1][0], data[1][1]);		
	};
	
	var _repaintWhiteboard = function() {
		var actions_data = store.get(), actions_count = actions_data.length, stored_config = {"color" : ctx.strokeStyle, "width" : ctx.lineWidth, "func" : shapeFunction};
		
		var _repaintItem = function(i) {
			var coords, config;
			if (i == actions_count) {
				return;
			}			 	
			config = actions_data[i].config;
			coords = actions_data[i].data;
			switch (actions_data[i].type) {
				case 'paint' :
					ctx.strokeStyle = config.color;
					ctx.lineWidth = config.width;
					actions.paint('start', coords[0][0], coords[0][1]);
					for(var j = 0, len = coords.length; j < len; j++) { 
						actions.paint('continue', coords[j][0], coords[j][1]);
					}
					_repaintItem(i + 1);
					break;
				case 'image' : 
					img = new Image();
					img.onload = function() {
						ctx.drawImage(img, coords[0], coords[1], coords[2], coords[3]);
						_repaintItem(i + 1);
					}
					img.src = coords[4];
					break;
				case 'write' : 
					actions.writeComplete(coords[0], coords[1], coords[2], coords[3], "normal " + config.size + " " +  config.font, config.color, coords[4]);
					_repaintItem(i + 1);
					break;
				case 'shape' :
					ctx.strokeStyle = config.color;
					ctx.lineWidth = config.width;
					shapeFunction = PR2.shapes.get([config.shape]).shapeFunction;
					actions.shape('start', coords[0][0], coords[0][1]);
					actions.shape('end', coords[1][0], coords[1][1]);
					_repaintItem(i + 1);
					break;
			}
		};
		
		ctx.clearRect(0, 0, config.width, config.height);
		_repaintItem(0);
		
		ctx.strokeStyle = stored_config.color;
		ctx.lineWidth =  stored_config.width;
		shapeFunction = stored_config.func;
	}


	// create text editor and span to measure it's width for resize purpose
	var textheight_calculator = $.create('textarea', document.body, {"id" : "pr2_textheight_calculator"}, {"width" : "200px", "disabled" : true});	    
	var text_editor = $.create('textarea', document.body, {"id" : "pr2_text_editor", "class" : "pr2_editor pr2_handle"}, {"width" : "200px"});	

	// actions object which holds all the canvas actions
	var actions = {};
	
	// simply return if there is no special action for the whiteboard
	actions.none = function() { return; };
		
	// for the point action only the cursor pictogram is changed	
    actions.point = function(status, x, y) {
		x = x + bounds.left;
		y = y + bounds.top;
		if (status == 'start') {
			temp_canvas.style.cursor = 'url(icons/pointer-click.png), move';
			pointer_action_handler(x, y, 'down');
		}
		else if (status == 'continue') {
			pointer_action_handler(x, y, 'down_move'); 
		}
		else if (status == 'end') {
			temp_canvas.style.cursor = 'url(icons/pointer.png), move';
			pointer_action_handler(x, y, 'up');
	    }
		else if (status == 'up_move') {
			pointer_action_handler(x, y, 'up_move');
	    }
	};

	// write onto the canvas: left, top, with, height, font props, color, text
	// this is an intermediate action, where the text is put in a textarea
	// to really write the text on the canvas writeComplete is called
    actions.write = function(status, x, y) {
		if (dropped_image) {
			return;
		}
		// only write when there is something to write and the text editor is visible
		if (status == 'end') {
			if(text_editor.style.display != 'none' && text_editor.value != '') {
				var text = text_editor.value.replace(/&/g, '&amp;');
				actions.writeComplete(text_editor.offsetLeft - canvas.offsetLeft, text_editor.offsetTop - canvas.offsetTop, text_editor.offsetWidth, text_editor.offsetHeight, "normal " + config.fontSize + " " + config.fontFamily, config.strokeStyle, text, true);
			}
			else {
				showEditor(x, y);
			}
		}
	 
	};
	
	// finish the writing action
	actions.writeComplete = function(left, top, width, height, font, color, text, save) {
			var img = new Image() ;			 
			var svg_object = "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "'>" +
					"<foreignObject width='100%' height='100%'>" +
					  "<div xmlns='http://www.w3.org/1999/xhtml'>" +
						"<textarea style='border: 0; margin:0; outline:0; padding:0; background-color: transparent; font:" + font + "; color: " + color + "; height : "  + height + "px; width: " + width + "px'>" + text + "</textarea>" +
					  "</div>" +
					"</foreignObject>" +
				 "</svg>";  		
			var img_object = new Blob([svg_object], {type: "image/svg+xml;charset=utf-8"});
			var img_url = URL.createObjectURL(img_object);
			
			img.onload = function() {
				ctx.drawImage(img, left, top, width, height);
				URL.revokeObjectURL(img_url);
				if (save) {
					store.add('write', {"color" : config.strokeStyle, "font" : config.fontFamily, "size" : config.fontSize, "width" : ctx.lineWidth}, [text_editor.offsetLeft - canvas.offsetLeft, text_editor.offsetTop - canvas.offsetTop, text_editor.offsetWidth, text_editor.offsetHeight, text_editor.value]);
					text_editor.style.display = 'none';	
				}
			};
			img.src = img_url;					
	};
	
	// show the text editor 
	var showEditor = function(x, y) {
		var x_overflow, y_overflow;	
 
		$.css(text_editor, {'display' : 'block', 'top' :(bounds.top + y) + 'px', 'left' : (bounds.left + x) + 'px', fontFamily : config.fontFamily, fontSize : config.fontSize, color : config.strokeStyle});
		text_editor.value = '';	
		text_editor.focus();	
 
		y_overflow =  text_editor.offsetTop + text_editor.offsetHeight - bounds.bottom;
			x_overflow =  text_editor.offsetLeft + text_editor.offsetWidth - bounds.right;
		// clip the editor when it flows over the boundaries
		if(y_overflow > 0) {
			text_editor.style.height = (text_editor.offsetHeight - y_overflow) + 'px'; 
		}
		if(x_overflow > 0) {
			text_editor.style.width = (text_editor.offsetWidth - x_overflow) + 'px'; 
		}	
	};
	
	// Check if the mouse cursor in the drag handle (right upper) corner of a draggable element
    var _withinDragHandle = function(el, x, y) {
	    var borderR = el.offsetLeft + el.offsetWidth, borderL = borderR - 10, borderT = el.offsetTop, borderB = borderT + 10;
		return (x > borderL && y > borderT && x < borderR && y < borderB);
    };
	
	// Check if the mouse cursor in the resize handle (right down) corner of a draggable element	
    var _withinResizeHandle = function(el, x, y) {
	    var borderR = el.offsetLeft + el.offsetWidth, borderL = borderR - 10, borderB = el.offsetTop + el.offsetHeight, borderT = borderB - 10;
		return (x > borderL && y > borderT && x < borderR && y < borderB);
    };
	   
    // paint onto the canvas
	actions.paint = (function() {
		var old_x, old_y, coords = []; 
		return function(status, x, y, save) { 
			if (status == 'start') {
				coords = [];
				old_x = x - 1, old_y = y - 1;
				ctx.beginPath();
				ctx.moveTo(old_x, old_y);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.stroke();				
				if (save) { coords.push([x, y]); }
			}
			else if (status == 'continue') {
				ctx.beginPath();
				ctx.moveTo(old_x, old_y);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.stroke();
				if (save) { coords.push([x, y]); }
			}
			else if (status == 'end' && save) {
				store.add('paint', {color: config.strokeStyle, width : config.lineWidth}, coords);
			}
			old_x = x, old_y = y;
		}
	})();
 
    // create shapes on the canvas, it uses shape functions that are defined in the configuration file
	actions.shape = (function() {
		var start_x, start_y, coords = [];
		
		return function(status, x, y, save) {		
			if (status == 'start') {
				coords = [];
				start_x = x, start_y = y;		
				if (save) { coords.push([x, y]); }
			}
			else if (status == 'continue') { 
				temp_ctx.clearRect(0, 0, config.width, config.height); 
				shapeFunction(temp_ctx, start_x, start_y, x, y);
			}
			else if (status == 'end') {
				temp_ctx.clearRect(0, 0, config.width, config.height);
				shapeFunction(ctx, start_x, start_y, x, y);
				if (save) {
					coords.push([x, y]);
					store.add('shape', {color: config.strokeStyle, width : config.lineWidth, shape : config.shape}, coords);
				}
			}
		}		
	})(); 
 
	// put an image onto the whiteboard, but only in a draggable/resizable image editor: loaded image reference, x coord, y coord
	// to really put the image onto the canvas drawImage needs to be called
    function pasteImage(file, x, y) {
		var img = new Image(); 

		if(typeof file == 'string') {
			useDataURL();  
		}
		else {
			useFile();
		}

	    function useDataURL() {
			img.onload = function() {
				$.css(image_editor, {'display' : 'inline-block', 'top' : (y + 'px'), 'left' : (x + 'px'), 'backgroundImage' : "url('icons/resize-handle.png'), url('" + file + "')", 'backgroundSize' : 'auto auto, 100% 100%'});
				dropped_image = true;
				dataURL = file;
				scaleImage();
			}
			img.src = file; 
		}

		function useFile() {
			var fileReader;
			
			img.onload = function() {
				fileReader = new FileReader();
				fileReader.onload = function(e) {	
				   dataURL = e.target.result;
					$.css(image_editor, {'display' : 'inline-block', 'top' : (y + 'px'), 'left' : (x + 'px'), 'backgroundImage' : "url('icons/resize-handle.png'), url('" + e.target.result + "')", 'backgroundSize' : 'auto auto, 100% 100%'});
				   dropped_image = true;
				   scaleImage();
				}
				fileReader.readAsDataURL(file);
			}
			img.src = window.URL.createObjectURL(file);
		}

		function scaleImage(){
			var overflow_x = x + img.width - bounds.right, overflow_y = y + img.height - bounds.bottom, original_ratio = img.width / img.height;
			var remain_x = bounds.right - x, remain_y = bounds.bottom - y, remain_ratio = remain_x / remain_y;
			if(overflow_x > 0 || overflow_y > 0) {
				if(remain_ratio > original_ratio) {
					$.css(image_editor, {'height' : remain_y + 'px', 'width' :  Math.round(remain_y * original_ratio) + 'px'});
				}
				else {
					$.css(image_editor, {'width' : remain_x + 'px', 'height' : Math.round(remain_y * remain_ratio) + 'px'});
				}
			}
			else {
				$.css(image_editor, {'height' : img.height + 'px', 'width' : img.width + 'px'});
			}
		}
    }
    
    function drawImage(data_url, left, top, width, height) {
		var img = new Image(); 
		img.onload = function() {
			ctx.drawImage(img, left, top, width, height );
			store.add('image', null, [left, top, width, height, data_url]);
			image_editor.style.display = 'none';
			dropped_image = false;
		}
		img.src = data_url; 
    };
 
      
    // object to store the actions for undo and repaint operations
    var store = (function(){
		var stack = [], backup_stack = [], listeners = {clear : [], add : [], undo : [], redo : []};
		
		var broadCast = function(type, data) { 
			var callbacks = listeners[type]; 
			for (var i = 0, len = callbacks.length; i < len;  i++) {
				callbacks[i](type, data);
			}
		};
		
		return {
			add : function(action, config, data) {
				var item = { "type" : action, "config" : config, "data" : data };
				stack.push(item);
				backup_stack = [];
				action_change_handler('add', item);
			},
			redo : function() {
				var item = backup_stack.pop();
				stack.push(item);
				action_change_handler('redo', backup_stack.length == 0 ? false : true);
			},
			undo : function() {
				var item = stack.pop();
				backup_stack.push(item);  
				action_change_handler('undo', stack.length == 0 ? false : true);		
			},
			get : function() {		
				return stack;
			},
			count : function() {
				return stack.length;
			},
			backup_count : function() {
				return backup_stack.length;
			},
			last : function() {
				return stack[stack.length - 1];
			},
			clear : function() {
				stack = [], backup_stack = [];
				action_change_handler('clear', true);
			},
			concat : function(data) {
				stack.concat(data);
			},
			replace : function(data) {
				stack = data, backup_stack = [];
			}
		}    
    })();
 	store_ = store;
	var bounds = {}
	
    // OFFSET METHOD, returns the offset of the canvas: left, top, right, bottom
    var _getOffset = function() {
		bounds = {"left" : canvas.offsetLeft - window.scrollX, "top" : canvas.offsetTop - window.scrollY, "right" : canvas.offsetLeft + canvas.offsetWidth - window.scrollX, "bottom" : canvas.offsetTop + canvas.offsetHeight - window.scrollY};    
    };
	 
	_getOffset();
	current_action = actions.none;
	
	shapeFunction = function() { return; }
	
	// layers to prevent images and stuff flow outside of the canvas		
	$.create('div', document.body, {"id" : "pr2_bottom_layer", "class" : "pr2_canvas_border_layers"}, {"top" : (canvas.offsetTop + canvas.offsetHeight) + 'px'});
	$.create('div', document.body, {"id" : "pr2_left_layer", "class" : "pr2_canvas_border_layers"});
	$.create('div', document.body, {"id" : "pr2_right_layer", "class" : "pr2_canvas_border_layers"}, {"left" : (canvas.offsetLeft + canvas.offsetWidth) + 'px'}, {"border" : "solid red 1px"});	

 	$.subscribe(paste_buffer, {'DOMNodeInserted' : function (e) {
		var node = e.target;

		if(node.nodeType == 1 && node.tagName.toLowerCase() == 'img') { 
				pasteImage(node.src, bounds.left + 15 , bounds.top + 15);
				paste_buffer.lastChild.remove();
		}		
	}});
	
	$.subscribe(text_editor, {
		'keyup' : function() {
			textheight_calculator.value = this.value; 
			text_editor.style.height = (textheight_calculator.scrollHeight) + 'px';
		},
		'mouseup' : function() {
			textheight_calculator.style.width = (text_editor.offsetWidth - 4)  + 'px';
		},
		'mousemove' : function(e) {
			if(_withinDragHandle(this, e.clientX, e.clientY)) {
				this.style.cursor = 'move';				
			}				
			else if(_withinResizeHandle(this, e.clientX, e.clientY)) {
				this.style.cursor = 'se-resize';					
			}
			else {
				this.style.cursor = 'auto';					
			}
		},
		'mousedown' : function(e) {
			if(_withinDragHandle(this, e.clientX, e.clientY)) {
				drag_element = this;
			}
			else if (_withinResizeHandle(this, e.clientX, e.clientY)) {
				resize_element = this;
			}
		}
	});
	 
	var image_editor = $.create('div', document.body, {"class" : "pr2_editor", "id" : "pr2_image_editor"}, {"backgroundSize" : "100% 100%"});
	
	$.subscribe(image_editor, {
		'mousedown' : function(e) { 
			if(_withinResizeHandle(this, e.clientX, e.clientY)) { 
				resize_element = this;
				this.style.cursor = 'se-resize';
			}
			else {
				drag_element = image_editor;
				image_editor.offsetX = (e.clientX - image_editor.offsetLeft) + 'px';
				image_editor.offsetY = (e.clientY - image_editor.offsetTop) + 'px';
			}
		},	
		'mousemove' : function(e) {	 	
			if(_withinResizeHandle(this, e.clientX, e.clientY)) {
				this.style.cursor = 'se-resize';
			}
			else {
				this.style.cursor = 'move';					
			}				
		}
	});
	
	
	$.subscribe(file_picker, {'change' : function(e){
			var file = e.target.files[0];
			if (typeof file.type == undefined || !file.type.match(/image.*/)) return;
			e.preventDefault();
			if (image_add_target == 'whiteboard') {
				pasteImage(file, bounds.left + 15 , bounds.top + 15);
			}
			else {
				var fr = new FileReader();
				fr.onload = function(e) {
					self.setProperty('background', 'url(' + e.target.result + ')'); 
				}
				fr.readAsDataURL(file);
			}
		}			
	}); 
	
	$.subscribe(window, {
		'mouseup' : function(e) {
			if (mouse_down) {
				current_action('end', e.clientX - bounds.left, e.clientY - bounds.top, true);
			}
			resize_element = null, drag_element = null, mouse_down = false;
		},
		'mousemove' : function(e) {
			var el = e.target, x = e.clientX, y = e.clientY;
			e.preventDefault();
 
			if (mouse_down) {
				current_action('continue', e.clientX - bounds.left, e.clientY - bounds.top, true);
			}
			else if (config.action == 'point') {
				current_action('up_move', e.clientX - bounds.left, e.clientY - bounds.top);
			}
			
			// drag the text editor
			else if(text_editor == drag_element){					
				text_editor.style.cursor = 'move';
	 
				if(y < canvas.offsetTop) {
					text_editor.style.top = canvas.offsetTop + 'px';
				}
				else if(y >= canvas.offsetTop + canvas.offsetHeight  - text_editor.offsetHeight + 2) {
					text_editor.style.top = (canvas.offsetTop + canvas.offsetHeight - text_editor.offsetHeight + 2) + 'px';
				}
				else {
					text_editor.style.top = y + 'px';						
				}					
				if(x - text_editor.offsetWidth < canvas.offsetLeft) {
					text_editor.style.left = canvas.offsetLeft + 'px';
				}
				else if(x >= canvas.offsetLeft + canvas.offsetWidth + 2) {
					text_editor.style.left = (canvas.offsetLeft + canvas.offsetWidth - text_editor.offsetWidth + 2) + 'px';
				}
				else {
					text_editor.style.left = (x - text_editor.offsetWidth) + 'px';
				}		
			}  
			// drag the image editor
			else if(image_editor == drag_element) {
				$.css(image_editor, {top : (y - parseInt(image_editor.offsetY, 10)) +  "px", left : (x - parseInt(image_editor.offsetX, 10)) +  "px"});				 
			}
			// resize the text editor
			else if (text_editor == resize_element) { 
				$.css(text_editor, {height : (y - text_editor.offsetTop) + 'px', width : (x - text_editor.offsetLeft) + 'px', cursor : 'se-resize'});
			}
			// resize the image editor
			else if (image_editor == resize_element) {
				$.css(image_editor, {height : (y - image_editor.offsetTop) + 'px', width : (x - image_editor.offsetLeft) + 'px', cursor : 'se-resize'});
			}				
		},
		'keydown': function(e) {
			if (e.target.tagName.toLowerCase() == 'textarea') {
				return;
			}
			if (e.keyCode == 8 && dropped_image) {
				e.preventDefault();
				image_editor.style.display = 'none';
				dropped_image = false;
			}			
		},
		'paste' : function(e) {
			if(self.hasAccess() == false) { e.preventDefault(); }
			else if(e.target.tagName.toLowerCase() != 'textarea') {
				paste_buffer.focus();  
			}
		}
	});		
 
	$.subscribe(temp_canvas,{
		'dragover' : function(e) {
			e.preventDefault();
		},
		'dragenter' : function(e) {
			e.preventDefault();
		},
		'drop': function(e) {
			var file = e.dataTransfer.files[0];
			// no dropping if there's no ownership
			if (!access) { return; }
			
			// make sure there is no interference with the text editor
			text_editor.style.display = 'none';				
			// only allow image files
			if (typeof file.type == undefined || !file.type.match(/image.*/)) return;
			e.preventDefault();
			if (e.ctrlKey) {
				var fr = new FileReader();
				fr.onload = function(e) {
					self.setProperty('background', 'url(' + e.target.result + ')'); 
				}
				fr.readAsDataURL(file);
			}
			else {
				pasteImage(file, e.clientX - bounds.left, e.clientY - bounds.top);
			}
		},
		'mousedown' : function(e) {
			if (!access || dropped_image) { return; }
			e.preventDefault();
			mouse_down = true;
			current_action('start', e.clientX - bounds.left, e.clientY - bounds.top, true);		
		},
		'mousemove' : function(e) {
			if (!access || dropped_image) { return; }
			e.preventDefault();
			if (mouse_down) {
				current_action('continue', e.clientX - bounds.left, e.clientY - bounds.top, true);
			}		
		},
		'mouseup' : function(e) {
			if (!access) { return; }
			else if (dropped_image) {
				 drawImage(dataURL, image_editor.offsetLeft - bounds.left , image_editor.offsetTop - bounds.top , image_editor.offsetWidth -2, image_editor.offsetHeight - 2); 
				 return;
			}
			e.preventDefault();
			paste_buffer.focus();
		} 
	});	
	
	
	self = {
		/**
		 * Add an action to the whiteboard
		 * @method addAction
		 * @param action {Object} an object contaning the action data
		 */
		addAction : function(action) {
			_addAction(action);
		},
		/**
		 * Clear the whiteboard
		 * @method clear 
		 */
		clear : function() {
			ctx.clearRect(0, 0, config.width, config.height);
			store.clear();
		},
		/**
		 * Retrieve all the data from whiteboard actions (paint, shape, etc)
		 * @method getData
		 * @return {Array} an array containing all the actions
		 */
		getData : function(){
			return store.get();
		},
		/**
		 * Returns the value of the specified property
		 * @method getProperty
		 * @return {String} the property value
		 */		
		getProperty : function(property) {
			return _getProperty(property);
		},
		/**
		 * Inform if the user is allowed to perform actions on the whiteboard
		 * @method hasAccess
		 * @return {Boolean} true if the user is allowed to perform actions on the whiteboard, or false if not
		 */
		hasAccess : function() {
			return access;
		},
		/**
		 * Trigger the opening of the file picker for either putting an image as a backgound or as image onto the whiteboard
		 * @method putImage
		 * @param target {String} value can be either 'background' (to add as background) or 'whiteboard' (to add onto the whiteboard)
		 */
		putImage : function(target) {
				image_add_target = target;
				file_picker.click();
			},
		/**
		 * Redo an undone whiteboard action. Note: when a new action is performed on the whiteboard the list with actions to be redone will be cleared.
		 * @method redo
		 */
		redo : function() {
			if (store.backup_count() > 0) {
				store.redo();
				_repaintWhiteboard();
			}
		},
		/**
		 * Save a snapshot of the whiteboard.
		 * @method save
		 * @param target {String} only allowed value is currently 'local', to save the snapshot local
		 */
		save : function(target) {
			switch (target) {
				case 'local' : save_local(); break;
			}
		},
		/**
		 * Allow or disallows a user to perform actions on the whiteboard
		 * @method setAccess
		 * @return {Boolean} true to allow a user to perform actions on the whiteboard, or false to disallow
		 */
		setAccess : function(set_access) {
			if (set_access) {
				access = true;
				if(typeof config.action != 'undefined') { 
					_setProperty('action', config.action);
				}
			}
			else {
				access = false;
				temp_canvas.style.cursor = 'default';
			}
		},
		/**
		 * set the height and width of the whiteboard
		 * @method setDimensions
		 * @param height {Number} sets the height
		 * @param width {Number} sets the width
		 */
		setDimensions : function(height, width) {
			_setDimensions(height,width);
		},
		/**
		 * sets a property of the whiteboard
		 * @method setProperty
		 * @param property {String} represents the property to set, can be: 'action', 'shape', 'background', 'lineWidth', 'strokeStyle', 'fontFamily', 'fontSize', 'lineJoin', or 'lineCap'
		 * @param value {String} represents the property value to set
		 */
		setProperty : function(property, value) {
			_setProperty(property, value);
		},
		/**
		 * a shorthand to set multiple properties of the whiteboard at the same time
		 * @method setProperties
		 * @param properties_object {object} object that contains key/value pairs of properties and corresponding values
		 * @param value {String} represents the property value to set
		 */
		setProperties : function(properties_object) {
			for (property in properties_object) {
				if (properties_object.hasOwnProperty(property)) {
					_setProperty(property, properties_object[property])		
				}
			}
		},
		/**
		 * load Actions.
		 * @method loadActions
		 * @param actions {Array} an array of objects that contain whiteboard actions. Note: currently clears the whiteboard
		 */
		loadActions : function(data) {
			_loadActions(data);
		},
		/**
		 * undo a performed whiteboard action
		 * @method undo
		 */
		undo : function() {
			if (store.count() > 0) {
				store.undo();
				_repaintWhiteboard();
			}
		},
		/**
		 * Fired when an action occurs (add action, redo, undo, clear);
		 * @event onAction
		 * @param action {String} the action type
		 * @param value {Depends} in case of 'clear' simply true, in case of 'add' the data, in case of 'undo'/'redo' true if there items left to undo/redo
		 */ 
		onAction : function(callback) {
			action_change_handler = callback;
		},
		/**
		 * Fired when a property is changed
		 * @event onPropertyChange
		 * @param property {String} the name of the property
		 * @param value {String} the value of the property
		 */
		onPropertyChange : function(callback) {
			property_change_handler = callback;
		},
		/**
		 * Fired when the cursor is in pointer state on the whitebard
		 * @event onPointerAction
		 * @param x {Number} the pointer x coordinate
		 * @param y {Number} the pointer y coordinate
		 * @param state {String} the state of the pointer, can be up, down, up_move, or down_move
		 */
		onPointerAction : function(callback) {
			pointer_action_handler = callback;
		}
	}
	return self;
	
	
})(PR2.whiteboard);
