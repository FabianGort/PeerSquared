 
var PR2 = (function() {	
    // ********PRIVATE DECLARATIONS********
    var self, splash, container, wb_toolbar, mouse_down, remote_pointer, canvas, temp_canvas, ctx, temp_ctx, undo_button, canvas_bounds, text_editor, image_editor, start_menu, open_menu = null, credentials = {}, whiteboard_control,
		shapeFunction, // holds a reference to the current shape functions
		canvasAction, // holds a reference to the current canvas action
		dragElement = null, // the element that is being dragged, if any
		resizeElement = null, // the element that is being resized, if any
		droppedImage = false, // check if there is an editable image on the canvas
		dataURL = '', // URL that holds the data for an image on the canvas
 	canvas_config = {
		"canvasHeight" : 600,
		"canvasWidth" : 600,
		"strokeColor" : "red",
		"strokeWidth" : 1,
		"action" : "paint",
		"shape" : "line",
		"fontFamily" : "Arial",
		"fontSize" : "12px",
		"fontWeight" : "normal"
	}, 
	config = {
		colors :  ['Khaki', 'Yellow', 'Gold', 'Orange', 'Goldenrod', 'Lightgreen', 'Greenyellow', 'Lime', 'Green', 'Darkgreen', 'Orchid', 'Fuchsia', 'Hotpink', 'Blueviolet', 'Indigo', 'Salmon', 'Crimson', 'Firebrick', 'Red', 'Darkred', 'Cyan', 'Dodgerblue', 'Lightseagreen', 'Blue', 'Mediumblue', 'Tan', 'Peru', 'Chocolate', 'Saddlebrown', 'Brown',  'White', 'Lightgrey', 'Darkgray', 'Gray', 'Black'],
		widths : [1, 2, 5, 7, 10],
		fonts : ['Arial', 'Verdana', 'Courier', 'Georgia'],
		fontSizes : ['10px', '12px', '14px', '16px', '18px', '24px', '32px'],
		key_codes : [{"key": 87, "action": function() { self.setAction('write'); }}],
		canvas_backgrounds : [
			{"descr" : "Simply white", "image" : "simply-white.png", "type" : "repeat"},			
			{"descr" : "Medium blocked grid", "image" : "block-grid-medium.png", "type" : "repeat"},
			{"descr" : "Small blocked grid", "image" : "block-grid-small.png", "type" : "repeat"},
			{"descr" : "Large blocked grid", "image" : "block-grid-large.png", "type" : "repeat"},
			{"descr" : "Writing paper", "image" : "writing-paper.png", "type" : "repeat"},
			{"descr" : "Low contrast", "image" : "low-contrast.png", "type" : "repeat"},
			{"descr" : "Grid of dots", "image" : "dots.png", "type" : "repeat"},
			{"descr" : "Medium inverted grid", "image" : "block-grid-medium-invert.png", "type" : "repeat"},
			{"descr" : "School Board", "image" : "school-board.png", "type" : "repeat"},
			{"descr" : "School Board grid", "image" : "school-board-grid.png", "type" : "repeat"}  		
		]			
	},	
	shapes =  {
		"line" :
		  {"id" : "pr2_select_line_button", "title" : "Draw a line", "func" : function(context, start_x, start_y, end_x, end_y) {
			context.beginPath();
			context.moveTo(start_x, start_y);
			context.lineTo(end_x, end_y);
			context.closePath();
			context.stroke();
		  }},
		"arrow" :
		  {"id" : "pr2_select_arrow_button", "title" : "Draw an arrow", "func" : function(context, start_x, start_y, end_x, end_y) {
			var dX = end_x - start_x, dY = end_y - start_y, RC = dY/dX, arrowLength = 12,  
			arrow1 = Math.PI * 0.12 + Math.atan(RC), arrow1X = Math.cos(arrow1), arrow1Y = Math.sin(arrow1), arrow2 =  Math.atan(RC) - Math.PI * 0.12, arrow2X = Math.cos(arrow2), arrow2Y = Math.sin(arrow2);
 
			if(end_x < start_x) arrowLength = -arrowLength;
			context.beginPath();
			context.moveTo(start_x,start_y);
			context.lineTo(end_x,end_y);
			context.lineTo(end_x - arrowLength * arrow1X ,end_y -  arrowLength * arrow1Y);
			context.moveTo(end_x,end_y);
			context.lineTo(end_x - arrowLength * arrow2X ,end_y -  arrowLength * arrow2Y);
			context.stroke(); 			
		}},
		"axis" :
		  {"id" : "pr2_select_axis_button", "title" : "Draw an axis", "func" : function(context, start_x, start_y, end_x, end_y) {
			context.beginPath();			
			context.moveTo(start_x + (end_x - start_x) / 2, start_y); 
			context.lineTo(start_x + (end_x - start_x) / 2, end_y);
			context.moveTo(start_x, start_y + (end_y - start_y) / 2); 
			context.lineTo(end_x, start_y + (end_y - start_y) / 2);
			context.closePath();
			context.stroke();
			
		  }},
		"triangle" :
		  {"id" : "pr2_select_triangle_button", "title" : "Draw a triangle", "func" : function(context, start_x, start_y, end_x, end_y) {
			context.beginPath();
			context.moveTo(start_x, start_y);
			context.lineTo(start_x, end_y);
			context.lineTo(end_x, end_y);
			context.closePath();
			context.stroke();			
		  }},
		"triangle2" :
		  {"id" : "pr2_select_triangle2_button", "title" : "Draw a triangle", "func" : function(context, start_x, start_y, end_x, end_y) {
			context.beginPath();
			context.moveTo(start_x + (end_x - start_x) / 2, start_y);
			context.lineTo(end_x, end_y);
			context.lineTo(start_x, end_y);
			context.closePath();			
			context.stroke();
			
		   }},
		"rectangle" :
		  {"id" : "pr2_select_rectangle_button", "title" : "Draw a rectangle", "func" : function(context, start_x, start_y, end_x, end_y) {
			context.beginPath();
			context.rect(start_x, start_y, end_x - start_x, end_y - start_y);
			context.stroke();
		  }},
		"circle" :
		  {"id" : "pr2_select_circle_button", "title" : "Draw a circle", "func" : function(context, start_x, start_y, end_x, end_y) {
			var d_x = end_x - start_x, d_y = end_y - start_y, radius = Math.max(Math.abs(d_x), Math.abs(d_y)) / 2;
			var x_center = d_x >= 0 ? start_x + radius : start_x - radius;
			var y_center = d_y >= 0 ? start_y + radius : start_y - radius;
			
			context.beginPath();
			context.arc(x_center, y_center, radius, 0, 2 * Math.PI);
			context.stroke();
		}},
		"star" :
		  {"id" : "pr2_select_star_button", "title" : "Draw a star", "func" : function(context, start_x, start_y, end_x, end_y) {
				var points = 5, outer_radius = (end_x - start_x), inner_radius =  0.3 * outer_radius, new_outer_RAD, half_new_outer_RAD, RAD_distance = ( 2 * Math.PI / points), RAD_half_PI = Math.PI /2, i;
				context.moveTo(start_x, start_y);
				context.beginPath();
			
				for(i=0; i <= points; i++) {
					new_outer_RAD = (i + 1) * RAD_distance;     
					half_new_outer_RAD = new_outer_RAD - (RAD_distance / 2);  
					context.lineTo(start_x + Math.round(Math.cos(half_new_outer_RAD - RAD_half_PI) * inner_radius), start_y + Math.round(Math.sin(half_new_outer_RAD - RAD_half_PI) * inner_radius));
					context.lineTo(start_x + Math.round(Math.cos(new_outer_RAD - RAD_half_PI) * outer_radius), start_y + Math.round(Math.sin(new_outer_RAD - RAD_half_PI) * outer_radius));   	
				} 
				context.stroke();			
		  }}				  
	}
 	
    // UTILITIES
	
	// get reference to an element
    var _get = document.getElementById.bind(document);
	
	// create an element
    var _create = function(element_type, parent, attr, styles, events) {
		var element = document.createElement(element_type);
		
		if (typeof parent == 'object') {
			parent.appendChild(element);
		}
		else {
			document.getElementById(parent).appendChild(element);
		}
		if (typeof attr == 'object') {
			_setAttributes(element, attr);
		}
		if (typeof styles == 'object') {
			_setStyles(element, styles);
		}		
		return element;
    }   
   
	// set attributes for an element
    var _setAttributes = function(el, attrs) {
		for(var key in attrs) { if (key == 'html') { el.innerHTML = attrs[key]; }
			else { el.setAttribute(key, attrs[key]); }
		}
    };
    
	// set styles for an element
    var _setStyles = function(el, styles) {	for(var key in styles) { el.style[key] = styles[key]; }
    };
	
	// get the computed css value of an element
    var _css_value = function(element, property) { return window.getComputedStyle(element).getPropertyValue(property); }
 
    // OFFSET METHOD, returns the offset of the canvas: left, top, right, bottom
    var _getOffset = function() {
		canvas_bounds = {"left" : canvas.offsetLeft - window.scrollX, "top" : canvas.offsetTop - window.scrollY, "right" : canvas.offsetLeft + canvas.offsetWidth - window.scrollX, "bottom" : canvas.offsetTop + canvas.offsetHeight - window.scrollY};    
    };
    
	// function that creates and handles a confirm dialog
	var createConfirmDialog = function() {
		
		// reference container for callback function
		var _confirmed = null;
		
		// create the confirm dialog
		var confirm_dialog = _create("div", document.body, {"id" : "pr2_confirm_dialog"});
		_create("div", confirm_dialog, {"id" : "pr2_confirm_question"});			 

		// YES button
		var confirm_button_yes = _create("button", confirm_dialog, {"id" : "pr2_confirm_yes", "html": "Yes"});
		confirm_button_yes.addEventListener('click', function(e){
			_confirmed();
			_confirmed = null;
			self.splashScreen('hide');
			confirm_dialog.style.display = 'none';				
		});
		
		// CANCEL button
		var confirm_button_cancel = _create("button", confirm_dialog, {"id" : "pr2_confirm_cancel", "html" : "Cancel"});
		confirm_button_cancel.addEventListener('click', function(e){
			_confirmed = null;
			self.splashScreen('hide');
			confirm_dialog.style.display = 'none';
		});
		
		// public function to trigger a confirm dialog, parameters: the dialog message, and the callback function on confirmation  
		PR2.confirm = function(message, func)  {
			self.splashScreen('show');
			confirm_dialog.style.display = 'block';
			_get('pr2_confirm_question').textContent = message;
			_confirmed = func;
		};		
	};
	
	// call this to update the status of the undo button
    var _setUndoButton = function() {
		_actions.getActionCount() > 0 ?  undo_button.classList.remove("pr2_toolbutton_disabled") :  undo_button.classList.add("pr2_toolbutton_disabled");
    };
    
	// highlight the currently active toolbar button
    var _focusButton = function(button) {
	    var action_group = button.parentElement;
	    for (var i = 0; i < action_group.children.length; i++) {
			action_group.children[i].classList.remove('pr2_toolbutton_selected');		    
	    }
	    button.classList.add('pr2_toolbutton_selected');	
    };
    
	// hide the text and image editor
    var _hideEditors = function() {
		var editors = document.getElementsByClassName('pr2_editor');
		for (var i = 0; i < editors.length; i++) {
			editors[i].css('display', 'none');
		}
    };
	
	// Hide or show the start menu items, according to a (non-) delegated situation
	var startMenuVisibleItems = function(delegate) {
		var menu_items = start_menu.childNodes, i;
 
		if (delegate) {
			for (i = 0; i < menu_items.length; i++) {			
				if(menu_items[i].classList.contains('pr2_delegate_hide')) {
					menu_items[i].style.display = 'none';					
				}
				else if(menu_items[i].classList.contains('pr2_delegate_show')) {
					menu_items[i].style.display = 'inline-block';
				}
			}
		}
		else {
			for (i = 0; i < menu_items.length; i++) {			
				if(menu_items[i].classList.contains('pr2_delegate_hide')) {
					menu_items[i].style.display = 'inline-block';
				}
				else if(menu_items[i].classList.contains('pr2_delegate_show')) {
					menu_items[i].style.display = 'none';
				}
			}			
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
   
    // create shortcuts the program
    var _ctrlShortcuts = function() {
		window.addEventListener('keydown', function(e){
			var l = config.key_codes.length, i;
	 
			if(e.ctrlKey && e.keyCode != 86) {
				e.preventDefault();
				for (i = 0; i < l; i++) {
					if (e.keyCode == config.key_codes[i].key) {
						config.key_codes[i].action();
					}
				} 
			}
			else if (e.keyCode == 8 && image_editor.style.display != 'none') {
				e.preventDefault();
				image_editor.style.display = 'none';
			}			
		});
    };
 
 
	// canvasActions object which holds all the canvas actions
	var canvasActions = {};
	
	// simply return if there is no special action for the whiteboard
	canvasActions.none = function() { return; };
		
	// for the point action only the cursor pictogram is changed	
    canvasActions.point = function(status) {
		if (status == 'start') {
			temp_canvas.style.cursor = 'url(icons/pointer-click.png), move'; 			
		}
		else if (status == 'continue') {
			temp_canvas.style.cursor = 'url(icons/pointer.png), move'; 
		}
		else if (status == 'end') {
			temp_canvas.style.cursor = 'url(icons/pointer.png), move';  	
	    }
	};

	// write onto the canvas: left, top, with, height, font props, color, text
	// this is an intermediate action, where the text is put in a textarea
	// to really write the text on the canvas writeComplete is called
    canvasActions.write = function(status) {
		// only write when there is something to write and the text editor is visible		
		if (status == 'end' && _css_value(text_editor, 'display') != 'none' && text_editor.value != '') {
			var text = text_editor.value.replace(/&/g, '&amp;');
			canvasActions.writeComplete(text_editor.offsetLeft - canvas.offsetLeft, text_editor.offsetTop - canvas.offsetTop, text_editor.offsetWidth, text_editor.offsetHeight, "normal " + canvas_config.fontSize + " " + canvas_config.fontFamily, canvas_config.strokeColor, text);
		}
	};
	
	// finish the writing action
	canvasActions.writeComplete = function(left, top, width, height, font, color, text) {
			var img = new Image() ;			 
			var data = "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "'>" +
					"<foreignObject width='100%' height='100%'>" +
					  "<div xmlns='http://www.w3.org/1999/xhtml'>" +
						"<textarea style='border: 0; margin:0; outline:0; padding:0; background-color: transparent; font:" + font + "; color: " + color + "; height : "  + height + "px; width: " + width + "px'>" + text + "</textarea>" +
					  "</div>" +
					"</foreignObject>" +
				 "</svg>";  		
			var svg = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
			var url = URL.createObjectURL(svg);
			
			img.onload = function() {    
				ctx.drawImage(img, left, top, width, height);
				URL.revokeObjectURL(url);		        	 
			};
			img.src = url;					
	};
	
	// show the text editor 
	var showEditor = function(x, y) {
		var x_overflow, y_overflow;	
	
		text_editor.css('display', 'block').css('top', (canvas.offsetTop + y) + 'px').css('left', (canvas.offsetLeft + x) + 'px');
		text_editor.value = '';	
		text_editor.focus();	
 
		y_overflow =  text_editor.offsetTop + text_editor.offsetHeight - canvas_bounds.bottom;
			x_overflow =  text_editor.offsetLeft + text_editor.offsetWidth - canvas_bounds.right;
		// clip the editor when it flows over the boundaries
		if(y_overflow > 0) {
			text_editor.style.height = (text_editor.offsetHeight - y_overflow) + 'px';
		}
		if(x_overflow > 0) {
			text_editor.style.width = (text_editor.offsetWidth - x_overflow) + 'px';
		}	
	};
	   
    // paint onto the canvas
	canvasActions.paint = (function() {
		var old_x, old_y;
		return function(status, x, y) {
			if (status == 'start') {
				old_x = x - 1, old_y = y - 1;
				ctx.beginPath();
				ctx.moveTo(old_x, old_y);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.stroke();
			}
			else if (status == 'continue') {
				ctx.beginPath();
				ctx.moveTo(old_x, old_y);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.stroke();	
			}
			old_x = x, old_y = y;
		}
	})();
 
    // create shapes on the canvas, it uses shape functions that are defined in the configuration file
	canvasActions.shape = (function() {
		var start_x, start_y;
		
		return function(status, x, y) {
			if (status == 'start') {
				start_x = x, start_y = y;				
			}
			else if (status == 'continue') { 
				temp_ctx.clearRect(0, 0, canvas.width, canvas.height); 
				shapeFunction(temp_ctx, start_x, start_y, x, y);
			}
			else if (status == 'end') {
				temp_ctx.clearRect(0, 0, canvas.width, canvas.height);
				shapeFunction(ctx, start_x, start_y, x, y);
			}
		}		
	})(); 
 
	// put an image onto the whiteboard, but only in a draggable/resizable image editor: loaded image reference, x coord, y coord
	// to really put the image onto the canvas finalizeImage needs to be called
    function pasteImage(file, x, y) {
	    var img = new Image();
	    img.onload = function() {
		var overflow_x = x + this.width - canvas_bounds.right, overflow_y = y + this.height - canvas_bounds.bottom, original_ratio = this.width / this.height;
		var remain_x = canvas_bounds.right - x, remain_y = canvas_bounds.bottom - y, remain_ratio = remain_x / remain_y;
		if(overflow_x > 0 || overflow_y > 0) {
		    if(remain_ratio > original_ratio) {
				image_editor.css('height', (remain_y) + 'px').css('width' ,  Math.round(remain_y * original_ratio) + 'px');
		    }
		    else {
				image_editor.css('width', (remain_x) + 'px').css('height',  Math.round(remain_y * remain_ratio) + 'px');
		    }
		}
		else {
		    image_editor.css('height', this.height + 'px').css('width', this.width + 'px');
		}
 
		var fileReder = new FileReader();
		fileReder.onload = function(e) {	
		   image_editor.css('display', 'inline-block').css('top', y + 'px').css('left', x + 'px');
		   dataURL = e.target.result;
		   image_editor.css('backgroundImage', "url('icons/resize-handle.png'), url('" + e.target.result + "')").css('backgroundSize', 'auto auto, 100% 100%');
		   droppedImage = true;
		}
		fileReder.readAsDataURL(file);
	    }
	    img.src = window.URL.createObjectURL(file);
    }
    
    function finalizeImage() {
	var img = new Image(); 
		img.onload = function() {
			ctx.drawImage(img, image_editor.offsetLeft - canvas_bounds.left , image_editor.offsetTop - canvas_bounds.top , image_editor.offsetWidth -2, image_editor.offsetHeight - 2);
			_actions.storeAction('image');
			_actions.storeActionData([dataURL, image_editor.offsetLeft - canvas_bounds.left, image_editor.offsetTop - canvas_bounds.top, image_editor.offsetWidth - 2, image_editor.offsetHeight - 2]);
			PR2.peer.send('action', _actions.getLastItem());
			_setUndoButton();
			image_editor.style.display = 'none';
			droppedImage = false;
		}
		img.src = dataURL; 
    }
 
       
    // actions object to store the actions for undo and repaint operations
    var _actions = (function(){
		var stack = [], index = 0;
		
		return {
			storeAction : function(action, config) {
				index = stack.length;
				stack[index] = { "type" : action, "config" : config, "data" : [] }  
			},
			storeActionData : function(data) {     
				stack[index].data.push(data);
			},
			popStack : function() {		
				return stack.pop();
			},
			getActions : function() {		
				return stack;
			},	    
			getActionCount : function() {
				return stack.length;
			},
			getLastItem : function() {
				return stack[index];
			},
			clearAll : function() {
				stack = [], index = 0;
			}
		}    
    })();
  
	// Prototype function to set styles
	HTMLElement.prototype.css = function(property, value) {
		this.style[property] = value;
		return this;
	}
	
	// Overwrite properties of the initialization object
	var overwriteConfiguration = function(overwrite_config) { 
		for (config_item in overwrite_config) {
			if (config_item == 'canvas') {
				for (option in canvas_config) { 
					if (overwrite_config['canvas'].hasOwnProperty(option)) {
						canvas_config[option] = overwrite_config['canvas'][option];
					}
				}	
			}
			else if (config_item == 'shapes') {
				for (shape in config_item['shapes']) {
					config.shapes[shape] = config_item['shapes'].shape;
				}
			}
			else if (config.hasOwnProperty(config_item)) {
				config[config_item] = overwrite_config[config_item];
			}
		}		
	}
  
	// create canvas	
	var createCanvas = function() {
		
		canvas = _create("canvas", container, {"width" : canvas_config.canvasWidth, "height" : canvas_config.canvasHeight, "id" : "pr2_canvas", "class" : "pr2_canvas"});
		ctx = canvas.getContext("2d");    
				
		// create upper temporary canvas
		temp_canvas = _create("canvas", container, {"width" : canvas_config.canvasWidth, "height" : canvas_config.canvasHeight, "id" : "pr2_temp_canvas", "class" : "pr2_canvas"});		
		temp_ctx = temp_canvas.getContext("2d");	            	    
		temp_canvas.addEventListener('mousedown', function(e) {
			var x = e.clientX - canvas_bounds.left, y = e.clientY - canvas_bounds.top;
			if (self.hasWhiteboardControl() == false) {
				return;
			}
			e.preventDefault();
			if (droppedImage) {
				 finalizeImage();
				 return;
			}
			
			mouse_down = true;
			canvasAction('start', x, y);
			switch (canvas_config.action) {
				case  'paint' :
					_actions.storeAction('paint', {"color" : ctx.strokeStyle, "width" : ctx.lineWidth});
					_actions.storeActionData([x, y]);
					break;
				case 'shape' :
					_actions.storeAction('shape', {"shape" : canvas_config.shape, "color" : ctx.strokeStyle, "width" : ctx.lineWidth});
					_actions.storeActionData([x, y]);						
					break;
				case 'point' :
					PR2.peer.send('action', {type: 'point', data: ['down', x, y]});
					break;							
			}
			
		});
		temp_canvas.addEventListener('mousemove', function(e) {
			var x = e.clientX - canvas_bounds.left, y = e.clientY - canvas_bounds.top;
			
			if (self.hasWhiteboardControl() == false) {
				return;
			}
			else if (canvas_config.action == 'point') {
				PR2.peer.send('action', {type: 'point', data: ['move', x, y]});
			}
			e.preventDefault();
			if(mouse_down) {
				canvasAction('continue', x, y);
				if (canvas_config.action == 'paint') {
					_actions.storeActionData([x, y]);
				}
			}
		});
		temp_canvas.addEventListener('mouseup', function(e) {
			var x = e.clientX - canvas_bounds.left, y = e.clientY - canvas_bounds.top;
			if (self.hasWhiteboardControl() == false) {
				return;
			}			
			e.preventDefault();
			if(mouse_down) {
				mouse_down = false;
				canvasAction('end', x, y);
				
				switch (canvas_config.action) {
					case 'paint' :
					 	PR2.peer.send('action', _actions.getLastItem());
						break;
					case 'point' :
						PR2.peer.send('action', {type: 'point', data: ['up', x, y]});
						break;
					case 'shape' :
						_actions.storeActionData([x, y]);
						PR2.peer.send('action', _actions.getLastItem());
						break;
					case 'write' :
						if (text_editor.value.length > 0 && text_editor.style.display != 'none') {
							_actions.storeAction('write', {"color" : canvas_config.strokeColor, "font" : canvas_config.fontFamily, "size" : canvas_config.fontSize, "width" : ctx.lineWidth});
							_actions.storeActionData([text_editor.offsetLeft - canvas.offsetLeft, text_editor.offsetTop - canvas.offsetTop, text_editor.offsetWidth, text_editor.offsetHeight, text_editor.value]);
							text_editor.style.display = 'none';
							PR2.peer.send('action', _actions.getLastItem());
							break;
						}
						else {
							showEditor(x,y);
						}
				}
				_setUndoButton();								
			}
		});		
		
		
		temp_canvas.addEventListener('dragover', function(e) {
			  e.preventDefault();
		});
		temp_canvas.addEventListener('dragstart', function(e) {
			  e.preventDefault();
		});	    
		 
		temp_canvas.addEventListener('drop', function(e) {
			var file = e.dataTransfer.files[0];
			
			// no dropping if there's no ownership
			if (self.hasWhiteboardControl() == false) {
				return;
			}
			// make sure there is no interference with the text editor
			text_editor.style.display = 'none';				
 
			if (typeof file.type == undefined || !file.type.match(/image.*/)) return;
			e.preventDefault();
			pasteImage(file, e.clientX, e.clientY);		    
		});
		
		// layers to prevent images and stuff flow outside of the canvas		
		_create('div', document.body, {"id" : "pr2_bottom_layer", "class" : "pr2_canvas_border_layers"}, {"top" : (canvas.offsetTop + canvas.offsetHeight) + 'px'});
		_create('div', document.body, {"id" : "pr2_left_layer", "class" : "pr2_canvas_border_layers"});
		_create('div', document.body, {"id" : "pr2_right_layer", "class" : "pr2_canvas_border_layers"}, {"left" : (canvas.offsetLeft + canvas.offsetWidth) + 'px'}, {"border" : "solid red 1px"});
		  
	}
 
	// create the chat panel with webcams and text chat box
	var createChatPanel = function() {
		var chat_container = _create('div', document.body, {"id" : "pr2_chat_container"}, {"left" : (canvas.offsetLeft + canvas.offsetWidth) + "px"}),
			video_container = _create('div', chat_container, {"id" : "pr2_video_container"}),
			mycam = _create('video', video_container, {"id" : "pr2_mycam", "class" : "pr2_video_container", "height" : 200, "width" : 300}),
			othercam = _create('video', video_container, {"id" : "pr2_othercam", "class" : "pr2_video_container", "height" : 200, "width" : 300}),
			chat_conversation = _create('div', chat_container, {"id" : "pr2_chat_conversation"}); 
			
			chat_conversation.addEventListener('click', function(e) {
				var id, el = e.target;
				if (el.tagName.toLowerCase() == 'a') {
					id = el.parentElement.id.substr(6);
					switch (el.classList[0]) {
						case 'accept' : PR2.download.acceptFile(id); e.preventDefault(); break;
						case 'decline' : PR2.download.declineFile(id); e.preventDefault(); break;
						case 'cancel' : PR2.download.cancelFile(id); e.preventDefault(); break;
						case 'cancel-local' : PR2.upload.localCancelFile(id); e.preventDefault(); break;
					}
				} 
			});							
			
		var	chat_input = _create('textarea', chat_container, {"id" : "pr2_chat_input", "cols" : 46, "rows" : 2, "disabled" : "true"});
			chat_input.addEventListener('keydown', function(e){
				if (e.keyCode === 13 && e.ctrlKey && this.value.length > 0)	{
					PR2.peer.sendChatMessage(this.value, "other");
					self.addChatMessage(this.value, "you");
					this.value = '';
				}
			});
			chat_input.addEventListener('dragover', function(e) {
				e.preventDefault();
			});
			
			chat_input.addEventListener('drop', function(e) {
				PR2.upload.loadFiles(e.dataTransfer.files);
				e.preventDefault();
			});			
			
			sendchat_button = _create('button', chat_container, {"id" : "pr2_sendchat_button", "html" : "&nbsp;", "class" : "pr2_toolbutton_disabled"});
			sendchat_button.addEventListener('click', function() {
				var text = chat_input.value;
				if (text.length == 0) {
					return;
				}
				PR2.peer.sendChatMessage(text, "other");
				self.addChatMessage(text, "you");
				chat_input.value = '';	
			});	
	}
	
    // ********PUBLIC DECLARATIONS********
    return {
		// public initialization object, which is destroyed on initialization
		init : function(init_object) {
			// !!!! undo_button resides in parent scope
			var credentials = init_object.credentials, toolbar, cam_toolbar, toolbar_items = {}, action_group, start_button, select_bg_button, file_picker, 
				paint_button, shape_button, select_color_button, color_picker, select_width_button, width_picker, select_shape_button,
				shape_picker, bg_picker, select_font, select_fontsize, textwidth_span, mouse_down = false;			
		
			// if an configuration object is passed, overwrite the confifuration
			if (typeof init_object.config == 'object') { overwriteConfiguration(init_object.config);}
			if (typeof credentials != 'object') { throw new Error('No credentials were provided');}
			
			// reference the global object	    
			self = this;
			
			// create and reference the global PR2 container
			container = _create('div', document.body, {"id" : "pr2_canvas_container"});
			
			// create the canvas
			createCanvas();
			
			// create the webcam panel
			createChatPanel();
			
			// create confirmation dialog
			createConfirmDialog();	
			 
			// create the toolbar
			toolbar = _create("span", container, {"id" : "pr2_toolbar"});		
			
			// create the home button
			start_button = _create('span', document.body, {"id" : "pr2_start_button", "title" : "Start"});
			
			// and a sub space for whiteboard tools
			wb_toolbar = _create("span", toolbar, {"id" : "pr2_wb_toolbar"}, {"display" : "inline-block"});
			
			// create a hidden download link
			_create("a", document.body , {"id" : "pr2_download_link", "download": "canvas.png", "target" : "_blank"}, {"display" : "none"});
			
			//create an invisible file picker that is triggered through another button
			file_picker = _create("input", document.body , {"id" : "pr2_file_picker", "type": "file", "accept" : "image/*"}, {"display" : "none"});
			file_picker.addEventListener('change', function(e){
				var file = e.target.files[0];
				if (typeof file.type == undefined || !file.type.match(/image.*/)) return;
				e.preventDefault();
				pasteImage(file, canvas_bounds.left +5 , canvas_bounds.top + 5);
				
			});
			
			// create the start menu
			start_menu = _create('ul', document.body, {"id" : "pr2_start_menu"}, {"display" : "none"});
			
			
			var start_menu_items = [
				{"text" : "Clear whiteboard", "title" : "Make the whiteboard empty again", "access" : {"teacher" : "always", "student" : "never"}, "func" : function(){
					PR2.confirm('Are you sure you want to clear the whiteboard',
						function() {
						   _actions.clearAll();
						   ctx.clearRect(0, 0, canvas.width, canvas.height);
						   _setUndoButton();									
						});
					}
				},
				{"text" : "Delegate control", "title" : "Delegate control to other", "teacherOnly" : true, "access" : {"teacher" : "always", "student" : "never"},  "func" : function(){
						open_menu = null;
						// delegate
						if (whiteboard_control) { 						
							this.textContent = 'Take back control';
							self.delegateWhiteboardControl(true);													
						}
						// take back control
						else {							 
							this.textContent = 'Delegate control to student';
							self.delegateWhiteboardControl(false);							
						} 
					}
				},
				{"text" : "Save whiteboard as image", "title" : "Save the whiteboard as an image", "access" : {"teacher" : "always", "student" : "always"}, "func" : function(){
					var img = new Image(), url ;	
					var save_img = _create('canvas', document.body, {"width" : canvas.width, "height" : canvas.height});
					var save_ctx = save_img.getContext('2d');
					
					if(canvas.style.backgroundImage == '') {
						save_ctx.fillStyle= "white";
						save_ctx.rect(0, 0, canvas.width, canvas.height);
						save_ctx.fill();
						canvasToImage();						
					}
					else {
						url = canvas.style.backgroundImage.slice(5,-2);
						img.onload = function() {
							var pat=ctx.createPattern(img,"repeat");
							save_ctx.rect(0,0,canvas.width,canvas.height);
							save_ctx.fillStyle=pat;
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
							
								var link = _get('pr2_download_link');
								link.href = URL.createObjectURL(blob);
								link.target ="_blank";
								link.click();
							 
						   }, 'image/png');					 
						}
					}
				},
				{"text" : "Add image to whiteboard", "title" : "Add an image to the whiteboard", "access" : {"teacher" : "no-delegate", "student" : "delegate"},  "func" : function(){
						file_picker.click();
					}
				},
				{"text" : "Go fullscreen", "title" : "Enter/exit fullscreen mode", "id" : "pr2_toggle_fullscreen", "access" : {"teacher" : "always", "student" : "always"}, "func" : function(e){
					//document.mozFullScreenElement == null ?	toolbar.mozRequestFullScreen() : document.mozCancelFullScreen();

					}
				}					
			];
 
			start_menu_items.forEach(function(item, index){
				var display = 'block', access_class  = '';
				if (credentials.level == 'teacher') {
					switch(item.access.teacher) {
						case 'never' : return; break;
						case 'delegate' : display = 'none'; access_class = 'pr2_delegate_show'; break;
						case 'no-delegate' : access_class = 'pr2_delegate_hide'; break;
					}
				}
				else if (credentials.level == 'student') {
					switch(item.access.student) {
						case 'never' : return; break;
						case 'delegate' : display = 'none'; access_class = 'pr2_delegate_show';  break;
						case 'no-delegate' : access_class = 'pr2_delegate_hide'; break;							
					}
				}
	
				var id = (typeof item.id == 'undefined') ? 'pr2_menu_item' + index : item.id;
				var el = _create('li', start_menu, {"html" : item.text, "class" : "pr2_menu_item " + access_class, "title" : item.title, "id" : id}, {"display" : display});
				// this is security work around for the fullscreen request, since it must be called directly from an element
				if (item.id== 'pr2_toggle_fullscreen') {
					el.addEventListener('click', function() {
						document.mozFullScreenElement == null ?	document.body.mozRequestFullScreen() : document.mozCancelFullScreen();
						open_menu = null;
						start_menu.style.display = 'none';
					});
				}
				el.clickHandle = item.func;
			});
			
			// create action and shape button in action group
			action_group = _create("span", wb_toolbar, {"id" : "pr2_actiongroup"}); 
			action_group.addEventListener('mousedown', function(e) { 
				if (e.target.classList.contains('pr2_actiongroup')) {
					self.setAction(e.target.getAttribute('data'));
				}
			});
			
			// action group buttons
			undo_button = _create('span', action_group, {"id" : "pr2_undo_button", "class" : "pr2_toolbutton pr2_toolbutton_disabled", "title" : "Undo (Ctrl-Z)"});
			undo_button.addEventListener('mousedown', function() { self.undo() });	    
	
			point_button = _create('span', action_group, {"id" : "pr2_point_button", "data" : "point", "class" : "pr2_toolbutton pr2_actiongroup", "title" : "Point with mouse (Ctrl-E)"});
			write_button = _create('span', action_group, {"id" : "pr2_write_button", "data" : "write", "class" : "pr2_toolbutton pr2_actiongroup", "title" : "Write text (Ctrl-W)"});		    
			paint_button = _create('span', action_group, {"id" : "pr2_paint_button", "data" : "paint", "class" : "pr2_toolbutton pr2_actiongroup", "title" : "Draw with pencil (Ctrl-D)"});	    
			shape_button = _create('span', action_group, {"id" : "pr2_shape_button", "data" : "shape", "class" : "pr2_toolbutton pr2_actiongroup", "title" : "Draw a shape (Ctrl-S)"});
			
			// spacer
			_create('span', wb_toolbar, {"class" : "pr2_spacer"});	    
			
			// color selector
			select_color_button = _create('span', wb_toolbar, {"id" : "pr2_select_color_button", "class" : "pr2_toolbutton pr2_picker_button", "title" : "Select color"});
			
			color_picker = _create('span', wb_toolbar, {"id" : "pr2_color_picker", "class" : "pr2_picker"}, {"display" : "none", "left" : select_color_button.offsetLeft + "px", "top" : (toolbar.offsetHeight + 4) + "px"});    		
			config.colors.forEach(function(color){ _create('span', color_picker, {"class" : "pr2_color_pallet_button"}, {"backgroundColor" : color}); });	 
			 
			// width selector
			select_width_button = _create('span', wb_toolbar, {"id" : "pr2_select_width_button", "class" : "pr2_toolbutton pr2_picker_button", "title" : "Select stroke width"});		
			width_picker = _create('span', wb_toolbar, {"id" : "pr2_width_picker", "class" : "pr2_picker"}, {"display" : "none", "left" : (select_width_button.offsetLeft) + "px", "top" : (toolbar.offsetHeight + 4) + "px"}); 
			config.widths.forEach(function(width){ var element = _create('span', width_picker, {"class" : "pr2_width_pallet_button"}, {"backgroundSize" : "20px " + width + "px"}); });	    
	 
			select_bg_button = _create('span', wb_toolbar, {"id" : "pr2_select_bg_button", "class" : "pr2_toolbutton pr2_picker_button", "title" : "Select background"});
 
			select_bg_button.addEventListener('dragenter', function(e){	e.preventDefault();	});
			select_bg_button.addEventListener('dragover', function(e) { e.preventDefault(); });
					
			select_bg_button.addEventListener('drop', function(e){
				var file = e.dataTransfer.files[0], valid_types = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
				
				// no dropping if there's no ownership
				if (self.hasWhiteboardControl() == false) {
					return;
				}
				e.preventDefault();
				if (valid_types.indexOf(file.type) > -1) {
					canvas.style.backgroundImage =  'url(' + URL.createObjectURL(file) + ')';
					draggableImage = true;
					URL.revokeObjectURL(file);
		
					var fr = new FileReader();
					fr.onload = function(e) {
						PR2.peer.send('bg_change', e.target.result);
					}
					fr.readAsDataURL(file);			
				}
			});			
			
			
			bg_picker = _create('span', wb_toolbar, {"id" : "pr2_bg_picker", "class" : "pr2_picker"}, {"display" : "none", "left" : select_bg_button.offsetLeft + "px", "top" : (toolbar.offsetHeight + 4) + "px"});
	 
			
			config.canvas_backgrounds.forEach(function(background){
			var container = _create('div', bg_picker, {"class" : "pr2_bg_pallet_button"}, {"backgroundImage" : "url(backgrounds/" + background.image + ")"}),
				image = _create('span', container, {"class" : "pr2_bg_pallet_button"}, {"backgroundImage" : "url(backgrounds/" + background.image + ")"}),
				description = _create('span', container, {"class" : "pr2_bg_pallet_button"}, {"backgroundImage" : "url(backgrounds/" + background.image + ")"});
				description.innerHTML = background.descr;
			});
			
			_create('p', bg_picker).innerHTML = "<b>Alternatively drag and drop and image from your computer on the background button.</u></b>";
 
			// shape selector
			select_shape_button = _create('span', wb_toolbar, {"id" : "pr2_select_shape_button", "class" : "pr2_toolbutton pr2_toolbutton pr2_picker_button", "title" : "Select shape"});
			shape_picker = _create('span', wb_toolbar, {"id" : "pr2_shape_picker", "class" : "pr2_picker"}, {"display" : "none", "left" : select_shape_button.offsetLeft + "px", "top" : (toolbar.offsetHeight + 4) + "px" }); 	    
			
			for (key in shapes) {
				_create('span', shape_picker, {"data" : key, "title" : shapes[key].title, "class" : "pr2_toolbutton pr2_shape_pallet_button", "id" : shapes[key].id});
			}
	 
			// spacer
			_create('span', wb_toolbar, {"class" : "pr2_spacer"});
			
			// text properties
			var t = _create('div', wb_toolbar, {"class" : "pr2-select-wrapper"});
			var select_font = _create('select', t, {"id" : "pr2_select_font"});
			config.fonts.forEach(function(i){
				_create('option', select_font, {"value" : i, "html" : i}, {"fontFamily" : i});
			});
			select_font.addEventListener('change', function(){
				self.setFontFamily(this.value);
				text_editor.style.height = (textwidth_span.scrollHeight) + 'px';				
			});
			
	
			var t = _create('div', wb_toolbar, {"class" : "pr2-select-wrapper"});
			
			var select_fontsize = _create('select', t,  {"id" : "pr2_select_fontsize"});
			select_fontsize.addEventListener('change', function(){
				self.setFontSize(this.value);
				text_editor.style.height = (textwidth_span.scrollHeight) + 'px';
			});				
			config.fontSizes.forEach(function(i){
				_create('option', select_fontsize, {"value" : i, "html" : i});
			});    
	 
			// create text editor and span to measure it's width for resize purpose
			textwidth_span = _create('textarea', document.body, {"id" : "pr2_textwidth_span"}, {"width" : "200px"});	    
			text_editor = _create('textarea', document.body, {"id" : "pr2_text_editor", "class" : "pr2_editor pr2_handle"}, {"width" : "200px"});
			
			text_editor.addEventListener('keyup', function() {
				textwidth_span.value = this.value; 
				text_editor.style.height = (textwidth_span.scrollHeight) + 'px';
			});
			
			text_editor.addEventListener('mouseup', function() {
				textwidth_span.style.width = (text_editor.offsetWidth - 4)  + 'px';
			});
 
			text_editor.addEventListener('mousemove', function(e) {
				if(_withinDragHandle(this, e.clientX, e.clientY)) {
					this.style.cursor = 'move';				
				}				
				else if(_withinResizeHandle(this, e.clientX, e.clientY)) {
					this.style.cursor = 'se-resize';					
				}
				else {
					this.style.cursor = 'auto';					
				}
			});
			
			text_editor.addEventListener('mousedown', function(e) {
				if(_withinDragHandle(this, e.clientX, e.clientY)) {
					dragElement = this;
				}
				else if (_withinResizeHandle(this, e.clientX, e.clientY)) {
					resizeElement = this;
				}
			});		
	 
			image_editor = _create('div', document.body, {"class" : "pr2_editor", "id" : "pr2_image_editor"}, {"backgroundSize" : "100% 100%"});
			image_editor.addEventListener('mousedown', function(e) { 
				if(_withinResizeHandle(this, e.clientX, e.clientY)) { 
					resizeElement = this;
 
					this.style.cursor = 'se-resize';
				}
				else {
					dragElement = image_editor;
					image_editor.offsetX = (e.clientX - image_editor.offsetLeft) + 'px';
					image_editor.offsetY = (e.clientY - image_editor.offsetTop) + 'px';
				}
			});
			
			image_editor.addEventListener('mousemove', function(e) {			
				if(_withinResizeHandle(this, e.clientX, e.clientY)) {
					this.style.cursor = 'se-resize';
				}
				else {
					this.style.cursor = 'move';					
				}				
			});
			
			
			// and a sub space for whiteboard tools
			
			cam_toolbar = _create("span", toolbar, {"id" : "pr2_cam_toolbar"}, {"left" : (  canvas.width - 8) + 'px'});
			
			// spacer
			_create('span', cam_toolbar, {"class" : "pr2_spacer"});	  			
			
			// add webcam start button
			cam_button = _create("span", cam_toolbar, {"id" : "pr2_cam_button", "class" : "pr2_toolbutton pr2_toolbutton_disabled"}, {"display" : "inline-block"});
			cam_button.addEventListener('click', function() {
				if (this.classList.contains('pr2_toolbutton_disabled')) {
					return;
				}
				if (this.classList.contains('pr2_active_cam_button')) {
					PR2.peer.quitCam();
				}				
				else {
					PR2.peer.initCam();
				}
				
			});
			var fullscreen_button = _create("span", cam_toolbar, {"id" : "pr2_fullscreen_button", "class" : "pr2_toolbutton"}, {"display" : "inline-block"});
			fullscreen_button.addEventListener('click', function() {	   
			   document.getElementById('pr2_video_container').mozRequestFullScreen();
			   document.getElementById('pr2_mycam').classList.add('pr2_mycam_fullscreen');
			   document.getElementById('pr2_othercam').classList.add('pr2_othercam_fullscreen');
			});
 
			document.addEventListener('mozfullscreenchange', function(e) {
				if(document.mozFullScreenElement == null) {
					_get('pr2_toggle_fullscreen').textContent = 'Go fullscreen';
					document.getElementById('pr2_mycam').classList.remove('pr2_mycam_fullscreen');
					document.getElementById('pr2_othercam').classList.remove('pr2_othercam_fullscreen');					
				}
				else {
					_get('pr2_toggle_fullscreen').textContent = 'Exit fullscreen';					
				}
				open_menu = null;
			});
			
			ctx.lineJoin = "round";
			ctx.lineCap = 'bevel'; 
			temp_ctx.lineJoin= "round"; 
			temp_ctx.lineCap = 'bevel';
			
			splash = _create('div', document.body, {"id" : "pr2_splash", "html" : "Waiting for connection with server"});
			remote_pointer = _create('div', document.body, {"id" : "pr2_remote_pointer"}, {"backgroundImage" : "icons/pointer.png"});			
			
			_ctrlShortcuts();
			_getOffset();
			
			whiteboard_control = (credentials.level == 'teacher') ? true : false;
			wb_toolbar.style.display = (whiteboard_control) ? 'inline-block' : 'none';
			self.setAction(canvas_config.action).setShape(canvas_config.shape).setColor(canvas_config.strokeColor).setWidth(canvas_config.strokeWidth).setFontFamily(canvas_config.fontFamily).setFontSize(canvas_config.fontSize);

 

			window.addEventListener('drop', function(e) { e.preventDefault(); });
			window.addEventListener('dragenter', function(e) { e.preventDefault(); });
			
			window.addEventListener('mousedown' ,function(e) {
				
				// work around for full screen mode
				if(e.target.id == 'pr2_toggle_fullscreen') { return; }
				
				// if there is an open menu
 
				if(open_menu != null) {
					var pickers = toolbar.getElementsByClassName('pr2_picker');
					
					// behavior of the picker elements
					
					// color
					if (e.target.classList.contains('pr2_color_pallet_button')) { self.setColor(e.target.style.backgroundColor); }
					
					// width
					else if (e.target.classList.contains('pr2_width_pallet_button')) { self.setWidth(parseInt(e.target.style.backgroundSize.split(" ")[1].slice(0, -2), 10)); }
					
					// shape
					else if (e.target.classList.contains('pr2_shape_pallet_button')) {
						self.setShape(e.target.getAttribute('data'));						
					}
 
					// backgrounds
					else if (e.target.classList.contains('pr2_bg_pallet_button')) {
						canvas.style.backgroundImage = e.target.style.backgroundImage;
						PR2.peer.send('bg_change', e.target.style.backgroundImage);
					}
 
					// start menu
					else if (e.target.classList.contains('pr2_menu_item')) {
						if (e.target.id != 'pr2_toggle_fullscreen') {
							e.target.clickHandle(e);
						}
					}					
					
					// close all the menu's, including start menu
					for (i = 0; i < pickers.length; i++) { 
						pickers[i].style.display = 'none';
					}					
					start_menu.style.display = 'none';
					
					// open new pickers, unless it was the open picker
					if(e.target.classList.contains('pr2_picker_button') && e.target != open_menu) { 
						e.target.nextSibling.style.display = 'inline-block';
						open_menu = e.target; 
					}				
					else if (e.target == start_button && e.target != open_menu) {		
						start_menu.style.display = 'block';
						open_menu = e.target;
					}
					else {
						open_menu = null;	
					}
				}
				// reopen a menu
				else if (e.target.classList.contains('pr2_picker_button')) {
					e.target.nextSibling.style.display = 'inline-block';
					open_menu = e.target;
				}				
				else if (e.target == start_button) {	
					start_menu.style.display = 'block';
					open_menu = e.target;
				}  
			});
 
			window.addEventListener('mouseup' ,function(e) {
				resizeElement = null, dragElement = null;
			});
	 
			window.addEventListener('mousemove', function(e) {
				var el = e.target, x = e.clientX, y = e.clientY;
				e.preventDefault();	
				// drag the text editor
				if(text_editor == dragElement){					
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
				else if(image_editor == dragElement) {				
					image_editor.style.top = (y - parseInt(image_editor.offsetY, 10)) +  "px";
					image_editor.style.left = (x - parseInt(image_editor.offsetX, 10)) +  "px";				 
				}
				else if (text_editor == resizeElement) {
					text_editor.style.height = (y - text_editor.offsetTop) + 'px';
					text_editor.style.width = (x - text_editor.offsetLeft) + 'px';
					text_editor.style.cursor = 'se-resize';
				}
				else if (image_editor == resizeElement) {
					image_editor.style.height = (y - image_editor.offsetTop) + 'px';
					image_editor.style.width = (x - image_editor.offsetLeft) + 'px';
					image_editor.style.cursor = 'se-resize';
				}				
			});
 
 
			if(typeof offline == 'undefined' || offline == false) {
				PR2.peer.socketConnect(credentials);
			}
			else if (offline == true) {
				PR2.splashScreen('hide');
			}
 
			delete this.init;
		},
		
		// PUBLIC UNDO METHOD
		undo : function() {
			var j, actions, action_count = _actions.getActionCount(), data, coord_count, stored_config = {"color" : ctx.strokeStyle, "width" : ctx.lineWidth, "func" : shapeFunction};
			
			ctx.clearRect(0, 0, canvas.width, canvas.height);
	
			if(action_count == 0) { return false; }
			_actions.popStack();
			action_count -= 1;
			actions = _actions.getActions();			
		   
			repaintItems(0);
			function repaintItems(i) {
				if (i == action_count) {
					return;
				}
				data = actions[i].data;
				switch (actions[i].type) {
					case 'paint' :
						coord_count = data.length;
						self.setColor(actions[i].config.color).setWidth(actions[i].config.width);
						canvasActions.paint('start', data[0][0], data[0][1]);
						for(j = 0; j < coord_count; j++) { 
							canvasActions.paint('continue', data[j][0], data[j][1]);
						}
						repaintItems(i + 1);
						break;
					case 'image' : 
						data = data[0];
						img = new Image();
						img.onload = function() {
							ctx.drawImage(img, data[1], data[2], data[3], data[4]);
							repaintItems(i + 1);
						}
						img.src = data[0];
						break;
					case 'write' :		
						data = data[0];								
						canvasActions.writeComplete(data[0], data[1], data[2], data[3], "normal " +  actions[i].config.size + " " +  actions[i].config.font, actions[i].config.color, data[4]);
						repaintItems(i + 1);
						break;
					case 'shape' : 
						self.setColor(actions[i].config.color).setWidth(actions[i].config.width);
						shapeFunction = shapes[actions[i].config.shape].func;
						canvasActions.shape('start', data[0][0], data[0][1]);
						canvasActions.shape('end', data[1][0], data[1][1]);
						repaintItems(i + 1);
						break;
				}
			}
			
			self.setColor(stored_config.color).setWidth(stored_config.width);
			shapeFunction = stored_config.func;
			_setUndoButton();
			if (whiteboard_control) { PR2.peer.send('undo'); }
		},
		addChatMessage : function(message, owner) { 
			var new_message = document.createElement('div') , chat = document.getElementById('pr2_chat_conversation');		
			if(owner == 'other') { new_message.classList.add('pr2_chat_other'); }			
			new_message.innerHTML = "<span>" + owner + ":</span><span>" + message + "</span>";
			document.getElementById('pr2_chat_conversation').appendChild(new_message);
			chat.scrollTop = chat.scrollHeight - parseInt(window.getComputedStyle(chat).getPropertyValue('height').slice(0,-2),10);			
		},
		
		
		// PUBLIC METHOD to set the action type
		setAction : function(type) {
			if (typeof type != 'string') {
				throw new Error('"setAction", argument must be of type string');
				return;
			}
			else if (['paint', 'point', 'shape', 'write'].indexOf[type] < 0) {
				throw new Error('"setAction", no vaid action');
				return;
			}

			canvasAction = canvasActions[type];
			canvas_config.action = type;
			
			PR2.peer.send('remote_pointer', (type == 'point') ? 'show' : 'hide');
	 					
			if (!whiteboard_control) {
				temp_canvas.style.cursor = 'default';
			}
			else if (type == 'point') {
				temp_canvas.style.cursor = 'url(icons/pointer.png), move';
			}
			else if (type == 'write') {
				temp_canvas.style.cursor = 'text';
			}
			else if (type == 'none') {
				temp_canvas.style.cursor = 'default';
			}			
			else {
				temp_canvas.style.cursor = 'crosshair';
			}				
			if (type != 'none') {
				_focusButton(_get('pr2_' + type + '_button'));
			}
  
			_hideEditors();
			
			return self;
		},
	
		// PUBLIC METHOD to set the shape
		setShape : function(type) {
			if (shapes.hasOwnProperty[type] == false) {
				throw new Error('"setShape", this is not a valid shape');
				return;
			}    
			canvas_config.shape = type;
			shapeFunction = shapes[type].func;
			_get('pr2_select_shape_button').style.backgroundPosition = window.getComputedStyle(document.getElementById('pr2_select_' + type + '_button')).getPropertyValue('background-position');
			return self;
		},	
		
		// PUBLIC METHOD to set width
		setWidth : function(width) {
			if (typeof width != 'number') {
				throw new Error('"setWidth", argument must be a number between 0 and 100');
				return;
			}
			_get('pr2_select_width_button').style.setProperty('background-size', '20px ' + width + 'px', 'important');
			ctx.lineWidth = width;
			temp_ctx.lineWidth = width;
			canvas_config.strokeWidth = width;
			return self;		 
		},
		
		// PUBLIC METHOD to set font-size
		setFontSize : function(font_size) {
			if (typeof font_size != 'string') {
				throw new Error('"setFontSize", argument must be of type string');
				return;
			}
			if (config.fontSizes.indexOf(font_size) == -1) {
				throw new Error('"setFontSize", argument is not a valid font size');
				return;
			}		    
			_get('pr2_select_fontsize').value = font_size;
			_get('pr2_text_editor').style.fontSize = font_size;
			_get('pr2_textwidth_span').style.fontSize = font_size;
			canvas_config.fontSize = font_size;
			return self;		 
		},
		
		// PUBLIC METHOD to set font-family
		setFontFamily : function(font) {
			if (typeof font != 'string') {
				throw new Error('"setFontFamily", argument must be a of type string');
				return;
			}
			if (config.fonts.indexOf(font) == -1) {
				throw new Error('"setFontFamily", argument is not a valid font family');
				return;
			}		    
			_get('pr2_select_font').value = font;
			_get('pr2_select_font').style.fontFamily = font;	    
			_get('pr2_text_editor').style.fontFamily = font;
			_get('pr2_textwidth_span').style.fontFamily = font;
			canvas_config.fontFamily = font;
			return self;		 
		},	
		
		// PUBLIC METHOD to set color
		setColor : function(color) {
			if (typeof color != 'string') {
				throw new Error('"setColor", argument must be of type string');
				return;
			}
			_get('pr2_select_color_button').style.backgroundColor = color;
			ctx.strokeStyle = color, ctx.shadowColor = color, temp_ctx.strokeStyle = color, temp_ctx.shadowColor = color, canvas_config.strokeColor = color;
			_get('pr2_text_editor').style.color = color;
			return self;
		},
		getCanvasConfig : function() {
			var returnConfig = {};
			for (property in canvas_config) {
				if (canvas_config.hasOwnProperty(property)) {
					returnConfig[property] = canvas_config[property];
				}
			}
			return returnConfig;
		},		
		splashScreen : function(show, message) {
			splash.style.display =  show == 'show' ? 'block' : 'none';
			splash.textContent = message || '';
		},
		setRemotePointer : function(display) {
			remote_pointer.style.display =  (display == 'show') ? 'block' : 'none';
		},
		hasWhiteboardControl : function() {
			return whiteboard_control;
		},
		// only applies to the teacher
		delegateWhiteboardControl : function(delegated) {
			if (credentials.level == 'student') { return; }
			
			if (delegated) {
				whiteboard_control = false;						
				wb_toolbar.style.display = 'none';
				temp_canvas.style.cursor = 'default';				
			}
			// if not delegated
			else {
				whiteboard_control = true;				
				wb_toolbar.style.display = 'inline-block';
				self.setAction(canvas_config.action).setShape(canvas_config.shape).setColor(canvas_config.strokeColor).setWidth(canvas_config.strokeWidth).setFontFamily(canvas_config.fontFamily).setFontSize(canvas_config.fontSize);
				remote_pointer.style.display = 'none';
			}
			
			startMenuVisibleItems(delegated);
			PR2.peer.delegateSend(delegated);			
		},
		
		// only applies to the student
		getWhiteboardControl : function(delegated) {
			if (credentials.level == 'teacher') { return; }
			
			if (delegated) {
				whiteboard_control = true;				
				wb_toolbar.style.display = 'inline-block'; 		
				self.setAction(canvas_config.action).setShape(canvas_config.shape).setColor(canvas_config.strokeColor).setWidth(canvas_config.strokeWidth).setFontFamily(canvas_config.fontFamily).setFontSize(canvas_config.fontSize);
			}
			// if not delegated
			else {
				whiteboard_control = false;				
				temp_canvas.style.cursor = 'default';
				wb_toolbar.style.display = 'none';
				remote_pointer.style.display = 'none';		 
			}
			startMenuVisibleItems(delegated);
		},
		processActionData : function(action) {
			var data = action.data, config = action.config, i;
		
			if(typeof config != 'undefined') self.setColor(config.color).setWidth(config.width);
			
			switch (action.type) {
				case 'paint' :
					canvasActions.paint('start', data[0][0], data[0][1]);
					_actions.storeAction('paint', {"color" : config.color, "width" : config.width});
									
					for (i = 1; i < data.length; i++) {
						canvasActions.paint('continue', data[i][0], data[i][1]);
						_actions.storeActionData([data[i][0], data[i][1]]);	
					}
					break;
				case 'point' :
					remote_pointer.style.backgroundImage = (data[0] == 'down') ? 'url(icons/pointer-click.png)' : 'url(icons/pointer.png)';							
					remote_pointer.style.top = (data[2] + canvas_bounds.top) + 'px';
					remote_pointer.style.left = (data[1] +canvas_bounds.left) + 'px';				
					break;
				case 'write' :
					data = data[0];
					canvasActions.writeComplete(data[0], data[1], data[2], data[3],  "normal " + config.size + " " + config.font, config.color, data[4]);
					_actions.storeAction('write', {"color" : config.color, "font" : config.font, "size" : config.size, "width" : config.width});
					_actions.storeActionData([data[0], data[1], data[2], data[3], data[4]]);		
					break;
				case 'image' :
					data = data[0];
					img = new Image();
					img.onload = function() {
						ctx.drawImage(img, data[1], data[2], data[3], data[4]);			
						_actions.storeAction('image');
						_actions.storeActionData([data[0], data[1], data[2], data[3], data[4]]);			
					}
					img.src = data[0];
					break;
				case 'shape' :					
					self.setShape(config.shape);
					canvasActions.shape('start', data[0][0], data[0][1])
					canvasActions.shape('end', data[1][0], data[1][1]);
					_actions.storeAction('shape', {"shape" : config.shape, "color" : config.color, "width" : config.width});
					_actions.storeActionData(data[0]);
					_actions.storeActionData(data[1]);						
					break;
			}
			_setUndoButton();
		},
		changeBackground : function(image_url) {
			if(image_url.indexOf('data:') == 0) {
				canvas.style.backgroundImage = 'url(' + image_url + ')';
			}
			else {
				canvas.style.backgroundImage = image_url;
			}
		},
		toggleChatPanel : function(enable) {
				if (enable == 'enable') {
					_get('pr2_chat_input').disabled = false;
					_get('pr2_sendchat_button').classList.remove('pr2_toolbutton_disabled');
					_get('pr2_cam_button').classList.remove('pr2_toolbutton_disabled');					
				}
				else if (enable == 'disable') {
					_get('pr2_chat_input').disabled = true;			 	
					_get('pr2_sendchat_button').classList.add('pr2_toolbutton_disabled');
					_get('pr2_cam_button').classList.add('pr2_toolbutton_disabled');						
				}
		},
		startCam : function(cam_id, stream) {
			var cam = _get(cam_id);
			cam.src = URL.createObjectURL(stream);
			cam.play();
			if(cam_id == 'pr2_mycam') {
				_get('pr2_cam_button').classList.add('pr2_active_cam_button');
			}
		},
		stopCam : function(cam_id) {
			var cam = _get(cam_id);
			_get('pr2_cam_button').classList.remove('pr2_active_cam_button');
		}
    }	
})();

PR2.peer = (function() {
	var dataPC = null, mycamPC = null, othercamPC = null,
		other = '', // label for the other party
		credentials = {}, // credentials passed from the PR2.init() constructor method
		channels = {}, //object holds datachannels
		channelConfig = {
			"meta" : function(e) {		 
				var message =  JSON.parse(e.data);
				if (typeof message.sdp != 'undefined') {
					_setRemoteCamDescription(message.sdp);
				}				
			},
			"file" : function(e) {
				var message = JSON.parse(e.data);
				
				if(message.hasOwnProperty('offer')) {
					PR2.download.receiveOffer(message.offer);	
				}
				else if(message.hasOwnProperty('local-cancel')) {
					PR2.download.senderCanceledFile(message['local-cancel']);	
				}
				else if(message.hasOwnProperty('start')) {
					PR2.download.receiveFileData(message); 
				}
				else if(message.hasOwnProperty('complete')) {
					PR2.download.fileComplete(message.complete);
				} 
				else if(message.hasOwnProperty('accept')) {
					PR2.upload.offerAccepted(message.accept);
				}
				else if(message.hasOwnProperty('cancel')) {
					PR2.upload.fileCanceled(message.cancel);
				}				
				else if(message.hasOwnProperty('decline')) {
					PR2.upload.offerDeclined(message.decline);
				}
				else if(message.hasOwnProperty('received')) {
					PR2.upload.fileReceived(message.received);
				}
				else if(message.hasOwnProperty('progress')) {
					PR2.upload.fileProgress(message.progress);
				}				
			},
			"filedata" : function(e) {
				PR2.download.receiveFileChunk(e.data);
			},			
			"chat" : function(e) {
				var message = JSON.parse(e.data);
				PR2.addChatMessage(message.text, message.owner);				
			},			
			"delegate" : function(e) {
				if (credentials.level == 'teacher') {
					return;
				}
				PR2.getWhiteboardControl(e.data == 'true' ? true : false);
			},
			"whiteboard" : function(e) {
				var message = JSON.parse(e.data);
 
				if (PR2.hasWhiteboardControl()) { 
					return;
				}
				switch (message.command) {					
					case 'undo' : PR2.undo(); break;
					case 'action' : PR2.processActionData(message.data); break;
					case 'bg_change' : PR2.changeBackground(message.data); break;			
					case 'change_action' : PR2.setAction(message.data); break;
					case 'remote_pointer' : PR2.setRemotePointer(message.data); break;						
				}
			}		
		}; 
	
	var _initializePeerConnection = function() {
		log('initialize data channels');
		dataPC = new mozRTCPeerConnection(), channels = {}, connected = false;
 		
		dataPC.onconnection = function() {
			log('connected!');
			Socket.close();
			connected = true;
			PR2.splashScreen('hide');
			PR2.toggleChatPanel('enable');
			mycamPC = new mozRTCPeerConnection(); 
			othercamPC = new mozRTCPeerConnection() 
			othercamPC.onaddstream = function(e) {
				PR2.startCam('pr2_othercam', e.stream);
			}			
		}
		// reopen a websocket if the connection got closed by the other
		dataPC.onclosedconnection = function() {
			log('connection is closed');
			connected = false;
			Socket.open(credentials.room, credentials.name);
			PR2.toggleChatPanel('disable');
		}
 
		// teacher creates datachannels
		if (credentials.level == 'teacher') { 
			for (label in channelConfig) {
				channels[label] = dataPC.createDataChannel(label, {reliable : true});
				channels[label].onmessage = channelConfig[label];
				log( credentials.level + ' created ' + label + ' channel');				
			}				
			dataPC.createOffer(_SDPCreated, error);		 
		}
		// student listens for datachannels to be created 		
		else {
			dataPC.ondatachannel = function(e) {
				var label = e.channel.label;
				channels[label] = e.channel;
				channels[label].onmessage = channelConfig[label];
				log( credentials.level + ' created ' + label + ' channel');
			}
		}				
	};
	
	var log = function(message) {
		if(typeof debug != 'undefined' && debug) {
			console.log(message);
		}
	};	
	
	var error = function() {
		log('error');		
	};
	
	var _SDPCreated = function(desc) {
		Socket.send('sdp', desc);
		log(credentials.level + ': local description set for data channels');
		dataPC.setLocalDescription(desc);  
	};
		
 
	var _setDataChannelRemoteDescription = function(sdp) {
		dataPC.setRemoteDescription(new mozRTCSessionDescription(sdp));
		log(credentials.level + ': remote description set for data channels');
		// in case of an offer create an answer
		if (sdp.type == 'offer') {
			dataPC.createAnswer(_SDPCreated, error);
		}		
	};
	
	var _setRemoteCamDescription = function(sdp) {
		// in case of an offer create an answer
		if (sdp.type == 'offer') {
			othercamPC.setRemoteDescription(new mozRTCSessionDescription(sdp));
			othercamPC.createAnswer(_camSDPCreated, error);
			log(credentials.level + ': remote description set for other cam');
		}		 		
		else if(sdp.type == 'answer')  {
			mycamPC.setRemoteDescription(new mozRTCSessionDescription(sdp));
			log(credentials.level + ': remote description set for my cam');
	 	}	
	};	
	
	_camSDPCreated  =  function(sdp) {
 		if (sdp.type == 'answer') {
			log(credentials.level + ': local description set for other cam');
			othercamPC.setLocalDescription(sdp);
		}
		else if(sdp.type == 'offer') {
			log(credentials.level + ': local description set for my cam');
			mycamPC.setLocalDescription(sdp);
		}
		channels['meta'].send(JSON.stringify({"sdp" :sdp}));		
	};
 
	
 	return {
		// Establish a websocket connection with the server
		socketConnect : function(creds) {
			other = (creds.level == 'teacher') ? 'student' : 'teacher', credentials = creds;
			Socket.open(credentials.room, credentials.name);
			PR2.splashScreen('show', 'Connecting to the server');						
		},		
		onMemberAdded : function(count) {
			if (count == 1) {
				PR2.splashScreen('show', 'Waiting for the  ' + other + ' to join'); 
			}
			else if (count == 2) {
				log('clients are connection through a socket');				
				PR2.splashScreen('show', 'Connecting to ' + other + ', one moment please');
				_initializePeerConnection();
			}
		},
		// once available set the remote descriptions
		onRemoteDataChannelSDP : function(sdp) {
			_setDataChannelRemoteDescription(sdp);
		},
		// send data to the other client
		send : function(command, data){
			if(PR2.hasWhiteboardControl() && typeof channels['whiteboard'] != 'undefined') {
				channels['whiteboard'].send(JSON.stringify({"command" : command, "data" : data}));
			} 
		},
		// send (one way, teacher only) a delegate message
		delegateSend : function(delegate ) {
			if(credentials.level == 'teacher' && typeof channels['delegate'] != 'undefined') {
				channels['delegate'].send(JSON.stringify(delegate));
			}
		},
		sendFileData : function(data) {
			channels['filedata'].send(data);
		},
		sendFileInfo : function(message) {
			channels['file'].send(JSON.stringify(message));
		},
		sendChatMessage : function(text, owner) {
			channels['chat'].send(JSON.stringify({"text" : text, "owner" : owner}));
		},
		close : function() {
			if (dataPC != null) {
				dataPC.close();
			}
		},
		initCam : function() {
			navigator.mozGetUserMedia({audio : true, video : true}, function(stream) {
				PR2.startCam('pr2_mycam', stream);
				mycamPC.addStream(stream);
				mycamPC.createOffer(_camSDPCreated, error);
			}, error);
								   
		},
		quitCam : function() {
			mycamPC.localStreams[0].stop();
			mycamPC = new mozRTCPeerConnection();
			PR2.stopCam('pr2_mycam');
		},
		getPeerConnectionStatus : function() {
			return connected;
		}
	};
	
})();

 
PR2.upload = (function(){
	var sendFileList = {}, current = null, stack = [], chunkSize = 100000;
	var extension_blacklist = ['exe', 'com', 'vb', 'vbs', 'vbe', 'cmd', 'bat', 'ws', 'wsf', 'scr', 'shs', 'pif', 'hta', 'jar', 'js', 'jse', 'lnk', 'dll'];
 
	var trySendNext = function () {
		// start sending the next file if there is no current file and the stack is not empty
		if(current == null && stack.length > 0) { sendFile(stack.shift()); }
	}
 
 	var sendOffer = function(file) {
		var conversation = document.getElementById('pr2_chat_conversation');		
		var id = Date.now().toString().slice(-8) + '-' + Math.random().toString().slice(-8),
		progress_field = document.createElement('div'), file_field = document.createElement('div');

		file_field.innerHTML = '<span>you:</span><span id="sfile-' + id+ '">' + file.name + ' <a class="cancel-local" href="#">cancel</a></span>';
		conversation.appendChild(file_field);	
	
		progress_field.innerHTML = '<span></span><span><progress value="0" max="100" id="sprogr-' + id + '"></progress></span>';
		conversation.appendChild(progress_field); 

		sendFileList[id] = file; 
		PR2.peer.sendFileInfo({"offer" : {"id" : id, "name" : file.name}}); 
	};

	var sendFile = function(id) {
		var reader = new FileReader;
		current = sendFileList[id];
		reader.onload = function(e) {

			document.getElementById('sfile-' + id).innerHTML = current.name + ' is sending <a class="cancel-local" href="#">cancel</a>';
			current.buffer = e.target.result;
			current.chunks = Math.ceil(current.buffer.byteLength / chunkSize);
			current.currentChunk = 0;
			PR2.peer.sendFileInfo({"start" : id, "length" : current.size, "type" : current.type, "chunks" : current.chunks});

			PR2.peer.sendFileData(current.buffer.slice(current.currentChunk, current.currentChunk + chunkSize)); 
			sendFileList[id].currentChunk++;
			reader = null;
		}
		reader.readAsArrayBuffer(current);
	}

	return {
		loadFiles : function(files) {			
			for(var i = 0; i < files.length; i++) {
				if(extension_blacklist.indexOf(files[i].name.split('.').pop()) > -1) { console.log(files[i].name + ' has a potentially dangerous extensions and was therefore blocked'); return;}
				 sendOffer(files[i]);				
			}
		},
		offerAccepted : function(id) { 
			document.getElementById('sfile-' + id).innerHTML = sendFileList[id].name + ' is waiting';
			stack.push(id);
			trySendNext();
		},
		offerDeclined : function(id) {
			document.getElementById('sfile-' + id).innerHTML = sendFileList[id].name + ' is declined';
			delete sendFileList[id];
		},
		localCancelFile : function(id) {
			document.getElementById('sfile-' + id).innerHTML = 'You canceled ' + sendFileList[id].name;
			current = null;
			delete sendFileList[id];			
			PR2.peer.sendFileInfo({'local-cancel' : id});
		},
		fileReceived : function(id) {
			document.getElementById('sfile-' + id).innerHTML = current.name + ' is complete';
			delete sendFileList[id];
			current = null;
			trySendNext();
		},
		fileCanceled : function(id) {
			document.getElementById('sfile-' + id).innerHTML = current.name + ' is canceled by receiver';
			delete sendFileList[id];
			current = null;			
		},
		fileProgress : function(id) {
			if(current == null) { return; }
 			var start = current.currentChunk * chunkSize;
			PR2.peer.sendFileData(current.buffer.slice(start, start + chunkSize)); 
			current.currentChunk++;
			document.getElementById('sprogr-' + id).value = Math.round ( (current.currentChunk / current.chunks) * 100);
			
			if(current.currentChunk > current.chunks) {
				PR2.peer.sendFileInfo({"complete" : id});
			}
		}
	}

})();

 
PR2.download = (function(){
	 var receiveFileList = {}, current = null;
	 var extension_blacklist = ['exe', 'com', 'vb', 'vbs', 'vbe', 'cmd', 'bat', 'ws', 'wsf', 'scr', 'shs', 'pif', 'hta', 'jar', 'js', 'jse', 'lnk', 'dll'];

	return {
		receiveOffer : function(offer) {
			var conversation = document.getElementById('pr2_chat_conversation');
			var file_field = document.createElement('div'), progress_field = document.createElement('div');
			
			file_field.innerHTML = '<span class="pr2_chat_other">other:</span><span id="rfile-' + offer.id + '"><a class="decline" href="#">decline</a> | <a class="accept" href="#">accept</a> ' + offer.name + '</span>';
			conversation.appendChild(file_field);
			progress_field.innerHTML = '<span class="pr2_chat_other"></span><span><progress value="0" max="100" id="rprogr-' + offer.id + '"></progress></span>';
			conversation.appendChild(progress_field);
			
			receiveFileList[offer.id] = {"name" : offer.name};
		},
		declineFile : function(id) {
			PR2.peer.sendFileInfo({"decline" : id});
			document.getElementById('rfile-' + id).innerHTML = 'You declined ' + receiveFileList[id].name;
			delete receiveFileList[id]; 
		},
		acceptFile : function(id) {
			PR2.peer.sendFileInfo({"accept" : id});		
			document.getElementById('rfile-' + id).innerHTML = receiveFileList[id].name + ' is waiting';			
		},
		senderCanceledFile : function(id) {
			document.getElementById('rfile-' + id).innerHTML = receiveFileList[id].name + ' is canceled by sender';
			delete receiveFileList[id];
		},
		receiveFileData : function(data) {
			current = receiveFileList[data.start]; 
			current.id = data.start;
			current.chunkNumber = 0;
			current.length = data.length;
			current.type = data.type;
			current.chunks = data.chunks;
			current.data = [];
			document.getElementById('rfile-' + data.start).innerHTML = 'Receiving ' + current.name + ' <a class="cancel" href="#">cancel</a>';	
		},
		receiveFileChunk : function(chunk) {
			if(current == null) { return }
			current.data.push(chunk);
			current.chunkNumber++;
			document.getElementById("rprogr-" + current.id).value = Math.round ( (current.chunkNumber / current.chunks) * 100); 
			PR2.peer.sendFileInfo({"progress" : current.id});	
		},
		cancelFile : function(id) {
			current = null;
			delete receiveFileList[id];
			PR2.peer.sendFileInfo({"cancel" : id});		
		},
		fileComplete : function(id) {		
			var blob =  new Blob(current.data, { "type" : current.type });
			document.getElementById('rfile-' + id).innerHTML = '<a download="' + current.name +  '" href="' + URL.createObjectURL(blob) + '">' + current.name + '</a> is complete' ;
			URL.revokeObjectURL(blob);
			PR2.peer.sendFileInfo({"received" : id});			
			current = null;
		}		
	}

})();
 

