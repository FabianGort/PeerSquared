(function(credentials){
	// import utilities
	var $ = PR2.utils;
	
	// configure some whiteboard property values
	var fonts = ['Arial','Avant Garde', 'Bookman', 'Calibri' , 'Comic Sans MS', 'Courier', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
		font_sizes = ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '32px', '40px', '48px', '72px'],
		line_widths = [1, 2, 5, 7, 10, 15, 20],
		colors = ['Khaki', 'Yellow', 'Gold', 'Orange', 'Goldenrod', 'Lightgreen', 'Greenyellow', 'Lime', 'Green', 'Darkgreen', 'Orchid', 'Fuchsia', 'Hotpink', 'Blueviolet', 'Indigo', 'Salmon', 'Crimson', 'Firebrick', 'Red', 'Darkred', 'Cyan', 'Dodgerblue', 'Lightseagreen', 'Blue', 'Mediumblue', 'Tan', 'Peru', 'Chocolate', 'Saddlebrown', 'Brown',  'White', 'Lightgrey', 'Darkgray', 'Gray', 'Black'],
		canvas_backgrounds = [
		{"title" : "Simply white", "url" : "simply-white.png", "type" : "repeat"},
		{"title" : "Low contrast", "url" : "low-contrast.png", "type" : "repeat"},		
		{"title" : "Medium blocked grid", "url" : "block-grid-medium.png", "type" : "repeat"},
		{"title" : "Small blocked grid", "url" : "block-grid-small.png", "type" : "repeat"},
		{"title" : "Large blocked grid", "url" : "block-grid-large.png", "type" : "repeat"},
		{"title" : "Writing paper", "url" : "writing-paper.png", "type" : "repeat"},
		{"title" : "Grid of dots", "url" : "dots.png", "type" : "repeat"},
		{"title" : "Medium inverted grid", "url" : "block-grid-medium-invert.png", "type" : "repeat"},
		{"title" : "School Board", "url" : "school-board.png", "type" : "repeat"},
		{"title" : "School Board grid", "url" : "school-board-grid.png", "type" : "repeat"} 		    
	];
		
	// import shapes to the whiteboard	
	PR2.shapes.addMultiple({
		"line" : {
			"title" : "Draw a line",
			"style" : "background-position: -84px 0",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				context.beginPath();
				context.moveTo(start_x, start_y);
				context.lineTo(end_x, end_y);
				context.closePath();
				context.stroke();
			}
		},
		"arrow" : {

			"title" : "Draw an arrow",
			"style" : "background-position: -308px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
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
			}
		},
		"cosinus" : {
			"title" : "Draw a cosinus",
			"style" : "background-position: 0 -28px;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				var _end_x = end_x > start_x ? end_x : start_x,
					_start_x = end_x > start_x ? start_x : end_x, 
					baseY = (end_y - start_y) / 2 + start_y,
					ampY = baseY - start_y,
					dX = _end_x - _start_x, i = 0,
					step = (Math.PI * 2) / dX;
					
				context.beginPath();
				for(i = 0; i <= dX; i++) {		
					context.lineTo(i + _start_x,   -Math.cos(step * i) * ampY   + baseY);
				}
				context.stroke();
			}
		},
		"sinus" : {
			"title" : "Draw a sinus",
			"style" : "background-position: -28px -28px",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
			var _end_x = end_x > start_x ? end_x : start_x,
				_start_x = end_x > start_x ? start_x : end_x,
				baseY = (end_y - start_y) / 2 + start_y,
				ampY = baseY - start_y,
				dX = _end_x - _start_x, i = 0,
				step = (Math.PI * 2) / dX;
		
			context.beginPath();
			for(i = 0; i <= dX; i++) {		
				context.lineTo(i + _start_x,   -Math.sin(step * i) * ampY   + baseY);
			}
			context.stroke();
		}},
		"axis" : {
			"title" : "Draw an axis",
			"style" : "background-position: -364px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				context.beginPath();			
				context.moveTo(start_x + (end_x - start_x) / 2, start_y); 
				context.lineTo(start_x + (end_x - start_x) / 2, end_y);
				context.moveTo(start_x, start_y + (end_y - start_y) / 2); 
				context.lineTo(end_x, start_y + (end_y - start_y) / 2);
				context.closePath();
				context.stroke();	
			 }
		  },
		"triangle" : {
			"title" : "Draw a triangle",
			"style" : "background-position: -56px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				context.beginPath();
				context.moveTo(start_x, start_y);
				context.lineTo(start_x, end_y);
				context.lineTo(end_x, end_y);
				context.closePath();
				context.stroke();			
		  }
		},
		"triangle2" : {
			"title" : "Draw a triangle",
			"style" : "background-position: -336px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				context.beginPath();
				context.moveTo(start_x + (end_x - start_x) / 2, start_y);
				context.lineTo(end_x, end_y);
				context.lineTo(start_x, end_y);
				context.closePath();			
				context.stroke();
			
		   }
		},
		"rectangle" : {
			"title" : "Draw a rectangle",
			"style" : "background-position: 0 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				context.beginPath();
				context.rect(start_x, start_y, end_x - start_x, end_y - start_y);
				context.stroke();
		  }
		},
		"circle" : {
			"title" : "Draw a circle",
			"style" : "background-position: -28px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				var d_x = end_x - start_x, d_y = end_y - start_y, radius = Math.max(Math.abs(d_x), Math.abs(d_y)) / 2,
					x_center = d_x >= 0 ? start_x + radius : start_x - radius,
					y_center = d_y >= 0 ? start_y + radius : start_y - radius;
			
			context.beginPath();
			context.arc(x_center, y_center, radius, 0, 2 * Math.PI);
			context.stroke();
		}},
		"star" : {
			"title" : "Draw a star",
			"style" : "background-position: -252px 0;",
			"shapeFunction" : function(context, start_x, start_y, end_x, end_y) {
				var points = 5,
					outer_radius = (end_x - start_x),
					inner_radius =  0.3 * outer_radius,
					new_outer_RAD, half_new_outer_RAD,
					RAD_distance = ( 2 * Math.PI / points),
					RAD_half_PI = Math.PI /2,
					i;
				context.moveTo(start_x, start_y);
				context.beginPath();
			
				for(i = 0; i <= points; i++) {
					new_outer_RAD = (i + 1) * RAD_distance;     
					half_new_outer_RAD = new_outer_RAD - (RAD_distance / 2);  
					context.lineTo(start_x + Math.round(Math.cos(half_new_outer_RAD - RAD_half_PI) * inner_radius), start_y + Math.round(Math.sin(half_new_outer_RAD - RAD_half_PI) * inner_radius));
					context.lineTo(start_x + Math.round(Math.cos(new_outer_RAD - RAD_half_PI) * outer_radius), start_y + Math.round(Math.sin(new_outer_RAD - RAD_half_PI) * outer_radius));   	
				} 
				context.stroke();			
		}}				  
	});

	// Set the user credentials and return the level
	var level = PR2.user.setCredentials(credentials).getCredentials().level;
		
	// reference a remote pointer
	var remote_pointer = $.get('pr2_remote_pointer');
	
	// Configure the toolbar
	
	// Add submenu - whiteboard actions
	PR2.toolbar.addToMenu('sub_menu',  {
		"id" : "pr2_whiteboard_functions",
		"access" : "always", 
		"label" : "Whiteboard", "items" : [
		{
			// Delegate the whiteboard
			"id" : "pr2_delegate_whiteboard",
			"access" : level == "teacher" ? "always" : "never",
			"label" : "Delegate control",
			"action" : function() {
				// switch role
				if (PR2.user.getRole() == 'creator') {
					PR2.user.setRole('observer');
					PR2.peer.sendData(JSON.stringify({type : 'change-role', role : 'creator'}));
				}
				else {
					PR2.user.setRole('creator');
					PR2.peer.sendData(JSON.stringify({type : 'change-role', role : 'observer'}));
				}
			}
		},
		{
			// Synchronize
			"id" : "pr2_synhronize_whiteboard",
			"access" : level == "teacher" ? "always" : "never",
			"label" : "Synchronize",
			"action" : function() {
				PR2.modals.info('show', 'One moment... The whiteboards are synhronized now');
				PR2.peer.sendWhiteboardData(JSON.stringify({type : 'synchronize', data : PR2.whiteboard.getData()}));
				// a bit of a hack to synchronize the background
				PR2.peer.sendWhiteboardData(JSON.stringify({type : 'receive-whiteboard-propertychange', property : 'background', data : PR2.whiteboard.getProperty('background')}));
			}
		},
		{
			// Clear the whiteboard
			"id" : "pr2_clear_whiteboard",
			"access" : level == "teacher" ? "always" : "never",
			"label" : "Clear",
			"action" : function() {
				PR2.modals.confirm("Are you sure you want to clear the whiteboard?", PR2.whiteboard.clear);
			}
		}, {
			// save the whiteboard local
			"id" : "pr2_save_whiteboard_local",
			"access" : "always",
			"label" : "Save as image (local)",
			"action" : function() {
				PR2.whiteboard.save('local');
			}
		}]
	});
	
	// Add submenu - image actions
	PR2.toolbar.addToMenu('sub_menu',  {
		"id" : "pr2_add_image_functions",
		"access" : "creator",
		label: "Images",
		"items" : [{
			// add image to whiteboard
			"id" : "pr2_add_image",
			"access" : "creator", 
			"label" : "Add to whiteboard",
			"action" : function() {
				PR2.whiteboard.putImage('whiteboard');
			}
		}, {
			// add image to background
			"id" : "pr2_add_image_background",
			"access" : "creator", 			
			"label" : "Add as background",
			"action" : function() {
				PR2.whiteboard.putImage('background');
			}
		}]
	});
	
	// Add Menu item - fullscreen
	PR2.toolbar.addToMenu('menu_item', {
		"id" : "pr2_go_fullscreen",
		"label" : "Go fullscreen (Ctrl-F)",
		"access" : "always",
		"action" : function() {
			PR2.fullscreen.current() == null ? PR2.fullscreen.request() : PR2.fullscreen.cancel();
		}
	});
	
	// Create point button	
	PR2.toolbar.add('actions', 'button', {
		"id" : "pr2_point_button",
		"group" : "actions",
		"value": "point",
		"title" : "Point with mouse (Ctrl-E)",
		"action": function(value) {
			PR2.whiteboard.setProperty('action', value);
		}
	});
	
	// Create write button	
	PR2.toolbar.add('actions','button', {
		"id" : "pr2_write_button",
		"group" : "actions",
		"value": "write",
		"title" : "Write text (Ctrl-W)",
		"action" : function(value) {
			PR2.whiteboard.setProperty('action', value);
		}
	});
	
	// Create paint button	
	PR2.toolbar.add('actions', 'button', {
		"id" : "pr2_paint_button",
		"group" : "actions",
		"value": "paint",
		"title" : "Draw with pencil (Ctrl-D)",
		"action" : function(value) {
			PR2.whiteboard.setProperty('action', value);
		}
	});
	
	// Create shape button	
	PR2.toolbar.add('actions', 'button', {
		"id" : "pr2_shape_button",
		"group" : "actions",
		"value": "shape",
		"title": "Draw a shape (Ctrl-S)",
		"action" : function(value) {
			PR2.whiteboard.setProperty('action', value);
		}
	});
	
	// Create undo button	
	PR2.toolbar.add('history', 'button', {
		"id" : "pr2_undo_button",
		"value": "undo",
		"title": "Undo last action (Ctrl-Z)",
		"enabled" : false, "action" : PR2.whiteboard.undo
	});
	
	// Create redo button	
	PR2.toolbar.add('history', 'button', {
		"id" : "pr2_redo_button",
		"value": "redo",
		"title": "Redo last action",
		"enabled" : false,
		"action" : PR2.whiteboard.redo
	});
	
	// Create shape picker	
	PR2.toolbar.add('properties', 'picker', {
		"id" : "pr2_select_shape_button",
		"title" : "Select shape",
		items : (function() {
			var shapes = PR2.shapes.getAll(), items = [];
			
			for (shapetype in shapes) {
				items.push({
					"value" : shapetype,
					"title" : shapes[shapetype].title,
					"style" : shapes[shapetype].style
				});
			}
			return items;
		})(),
		"action" : function(value, element) {
			PR2.whiteboard.setProperty('shape', value);
		}
	});
	
	// Create linewidth picker	
	PR2.toolbar.add('properties', 'picker', {
		"id" : "pr2_select_linewidth_button",
		"title" : "Select width",
		items : (function() {
			var items = [];
			line_widths.forEach(function(width){
				items.push({
					"value" : width,
					"title" : "width: " + width + "px",
					"style" : "background-size : 20px " + width + "px !important"
				});
			});
			return items;
		})(),
		"action" : function(value, element) {
			PR2.whiteboard.setProperty('lineWidth', value);
		}
	});
	
	// Create color picker	
	PR2.toolbar.add('properties', 'picker', {
		"id" : "pr2_select_color_button",
		"title" : "Select color", items : (function() {
			var items = [];
			
			colors.forEach(function(color){
				items.push({
					"value" : color.toLowerCase(),
					"title" : "color: " + color,
					"style" : "background-color : " + color});
			});
			return items;
		})(),
		"action" : function(value, element) {  
			PR2.whiteboard.setProperty('strokeStyle', value);
		}
	});
	
	// Create background picker	
	PR2.toolbar.add('properties', 'picker', {
		"id" : "pr2_select_bg_button",
		"title" : "Select background",
		"items" : (function() {
			var items = [];
			
			canvas_backgrounds.forEach(function(background){
				items.push({
					"value" : "url(backgrounds/" + background.url + ")",
					"title" : "background: " + background.title,
					"style" : "background-image : url(backgrounds/" + background.url + ")"
				});
			});
			return items;
		})(),
		"action" : function(value, element) {
			PR2.whiteboard.setProperty('background', value);
		}
	});
	
	// Create font family picker	
	PR2.toolbar.add('properties', 'pulldown', {
		"id" : "pr2_select_font",
		"items" : fonts,
		"action" : function(event_type, font_family) {
			PR2.whiteboard.setProperty('fontFamily', font_family);
		}
	});
	// Create font size picker	
	PR2.toolbar.add('properties', 'pulldown', {
		"id" : "pr2_select_fontsize",
		"items" : font_sizes,
		"action" : function(event_type, font_size) {
			PR2.whiteboard.setProperty('fontSize', font_size);
		}
	});
	// Add whiteboard property change callback, to change button/picker state
	PR2.whiteboard.onPropertyChange(function(property, value) {
		switch (property) {
			case 'fontSize' : PR2.toolbar.focus("pr2_select_fontsize", value); break;
			case 'fontFamily' : PR2.toolbar.focus("pr2_select_font", value); break;
			case 'lineWidth' : PR2.toolbar.focus("pr2_select_linewidth_button", value); break;
			case 'action' :
				PR2.toolbar.focus("pr2_" + value + "_button");
				if (value == 'point' && PR2.user.getRole() == 'observer') {
					remote_pointer.style.display = 'block';
				}
				else {
					remote_pointer.style.display = 'none';
				}
				break;
			case 'shape' : PR2.toolbar.focus("pr2_select_shape_button", value); break;
			case 'strokeStyle' : PR2.toolbar.focus("pr2_select_color_button", value); break;
			case 'background' : PR2.toolbar.focus("pr2_select_bg_button", value); break; 	
		}
		if(PR2.user.getRole() == 'creator') {
			PR2.peer.sendWhiteboardData(JSON.stringify({type : 'receive-whiteboard-propertychange', property : property, data : value}));
		}		
	});
	// Add whiteboard action (add, redo, undo) callbacks
	PR2.whiteboard.onAction(function(action, value) {
		switch (action) {
			case 'clear' :
				PR2.toolbar.toggleButtonState("pr2_redo_button", "disable");
				PR2.toolbar.toggleButtonState("pr2_undo_button", "disable");
				break;
			case 'add' : 
				PR2.toolbar.toggleButtonState("pr2_undo_button", "enable");
				PR2.toolbar.toggleButtonState("pr2_redo_button", "disable");
				break;
			case 'undo' :
				PR2.toolbar.toggleButtonState("pr2_redo_button", "enable"); 
				if(!value) { PR2.toolbar.toggleButtonState("pr2_undo_button", "disable");  } 
				break;
			case 'redo' :
			PR2.toolbar.toggleButtonState("pr2_undo_button", "enable");
			if(!value) { PR2.toolbar.toggleButtonState("pr2_redo_button", "disable");  } 
			break;
		}
		if(PR2.user.getRole() == 'creator') {
			PR2.peer.sendWhiteboardData(JSON.stringify({type : 'receive-whiteboard-action', action : action, data : value}));
		}
	});
	
	PR2.whiteboard.onPointerAction(function(x, y, state) {
		PR2.peer.sendWhiteboardData(JSON.stringify({type : 'point', 'x' : x,  'y' : y, 'state' : state}));
	});

	
	// Set final actions to initialize the whiteboard, note that event subscriptions must occur before setting properties
	PR2.whiteboard.setDimensions(600, 900);
	PR2.whiteboard.setProperties({
		"lineJoin" : 'round',
		"lineCap" : 'round',
		"strokeStyle" : 'black',
		"lineWidth" : 1,
		"background" : 'url(backgrounds/block-grid-medium.png)',
		"shape": 'line', 
		"action" : 'paint',
		"fontFamily" : 'Verdana',
		"fontSize" : '14px'
	});
	
	// Handle the whiteboard messages from the peer object
	var handleWhiteboardMessage = function(type, value)  {
		switch (type) {
			case 'undo' : PR2.whiteboard.undo(); break;
			case 'redo' : PR2.whiteboard.redo(); break;
			case 'add' : PR2.whiteboard.addAction(value); break;
			case 'clear' : PR2.whiteboard.clear(); break;
		}
	};
	
	// Handele whiteboard property changes
	var handleWhiteboardChange = function(type, value) {
		PR2.whiteboard.setProperty(type, value);
	};
	
	var handleWhiteboardRemotePointer = function(data) {
		remote_pointer.style.top = data.y + 'px';
		remote_pointer.style.left = data.x + 'px';	
		switch (data.state) {
			case 'up' :
				remote_pointer.style.backgroundImage = 'url(icons/pointer.png)';							
				break;
			case 'down' :
				remote_pointer.style.backgroundImage = 'url(icons/pointer-click.png)';							
				break;
		}
	};
	
	var synchronizeWhiteboardData = function(data) {
		PR2.whiteboard.clear();
		PR2.whiteboard.loadActions(data);
		PR2.modals.info('hide');
		PR2.peer.sendWhiteboardData(JSON.stringify({type : 'synchronization-complete'}));
	};
	
	 // Add fullscreen change callback
	PR2.fullscreen.onFullscreenChange(function(fullscreenElement) {
		if(fullscreenElement == null)  {
			$.get('pr2_go_fullscreen').textContent = 'Go fullscreen (Ctrl-F)';
			$.get('pr2_remote_player').classList.remove('pr2_remote_player_fullscreen');
		}
		else if (fullscreenElement == $.get('pr2_player_container')) {
			$.get('pr2_remote_player').classList.add('pr2_remote_player_fullscreen');
		}
		else {
			$.get('pr2_go_fullscreen').textContent =  'Leave fullscreen (Ctrl-F)'; 
		}
	});
	
	// Add shortcuts
	PR2.shortcuts.add({"key": 87, "action": function() { PR2.whiteboard.setProperty('action', 'write'); }}); 
	PR2.shortcuts.add({"key": 68, "action": function() { PR2.whiteboard.setProperty('action', 'paint'); }}); 
	PR2.shortcuts.add({"key": 83, "action": function() { PR2.whiteboard.setProperty('action', 'shape'); }}); 
	PR2.shortcuts.add({"key": 69, "action": function() { PR2.whiteboard.setProperty('action', 'point'); }});
	PR2.shortcuts.add({"key": 79, "action": function() { PR2.whiteboard.putImage('whiteboard'); }});
	PR2.shortcuts.add({"key": 80, "action": function() { PR2.whiteboard.putImage('background'); }});
	PR2.shortcuts.add({"key": 70, "action": function() { PR2.fullscreen.current() == null ? PR2.fullscreen.request() : PR2.fullscreen.cancel() }});
	PR2.shortcuts.add({"key": 90, "action": PR2.whiteboard.undo});
	PR2.shortcuts.add({"key": 89, "action": PR2.whiteboard.redo});

	
	
	// Resize the chat and cam fields to fit into the screen
	(function() {
		var canvas  = $.get('pr2_canvas'),
			chat_container = $.get('pr2_chat_container'),
			player_container = $.get('pr2_player_container'),
			canvas_right = canvas.offsetLeft + canvas.offsetWidth,
			player_container_top = chat_container.offsetTop + chat_container.offsetHeight,
			max_width = 1500;
	  
	  chat_container.style.left = canvas_right + 'px';
	  player_container.style.left = canvas_right + 'px';
	  player_container.style.top = player_container_top + 'px';
	// resize chat and cam fields on their right to a maximum of 'max_width'
	 if (window.screen.availWidth > max_width) {
		
		chat_container.style.right = player_container.style.right = (window.screen.availWidth - max_width) + 'px'; 
	 }
	})();

	// Set waiting splash screen
	PR2.modals.info('show', 'Waiting for ' + (level == 'teacher' ? 'student' : 'teacher') + ' to join..');
	
	// Set events that happen when a role of a user changes
	PR2.user.onRoleChange(function(role) {
		// set access to the whiteboard
		PR2.whiteboard.setAccess(role == 'creator' ?  true : false);
		// set the access of the menu
		PR2.toolbar.setMenuAccess(role);
		// hide the control bar for the observer, show it for the creator
		PR2.toolbar.toggleControls(role == 'creator'? 'show' : 'hide');
		// change the menu item text
		$.get('pr2_delegate_whiteboard').textContent = (role == 'creator') ? 'Delegate control' : 'Take back control';

	});
	
	///////////////////////////////////////////////////////////////////////////////////////////
	// Now everything is set we can start a socket and peer connection to exchange peer data //	
	///////////////////////////////////////////////////////////////////////////////////////////
	
	// When the users are connected initialize oeer object, and start connecting the peers
	Socket.onUsersConnect(function() {
		PR2.peer.init();
		// create peer connection if user is teacher
		if(level == 'teacher') {
			PR2.peer.connect();
		}
	});

	// Send message to peer object from the socket server when information becomes available
	Socket.onMessage(function(message) {
		PR2.peer.addPeerInfo(message.type, message.data);
	});	

	// A simple function to stringify data and send it to the peer;
	var sendDataToPeer = function(data) {
		PR2.peer.sendData(JSON.stringify(data));
	};

	// Hide the info connection screen when there is a connection
	PR2.peer.onConnection(function() {
		PR2.modals.info('hide')
		// Set the user role
		setTimeout(function() { 
			PR2.user.setRole(level == 'teacher' ? 'creator' : 'observer');
			PR2.camplayer.toggleControls('show');
		}, 50);
	});
	
	// Once the peer object receives peer info (ice/sdp) send it through the websocket
	PR2.peer.onPeerInfo(function(type, data) {
		Socket.send({'type' : type, 'data' : data});
	});
	

	// Get data from a peer and delegate it
	PR2.peer.onData(function(data) {
		data = JSON.parse(data);
		switch (data.type) {
			case 'close-connection' : PR2.modals.info('show', 'Other has left');
			// Change role
			case 'change-role' :
				PR2.user.setRole(data.role); break;
			// Add chat message
			case 'receive-chat-message' :
				PR2.chatbox.addMessage('remote', data.message); break;
			// Add file offer
			case 'receive-offer' :
				PR2.download.receiveOffer(data.file_id, data.file_name); break;
			// Revoke a file offer
			case 'revoke-offer' :
				PR2.download.revokeOffer(data.file_id); break;
			// Decline file offer decline
			case 'decline-offer' :
				PR2.upload.declineOffer(data.file_id); break;
			// Accept offer
			case 'accept-offer' :
				PR2.upload.acceptOffer(data.file_id); break;
			// Start file transfer, receive meta data	
			case 'start-file' :
				PR2.download.receiveFileMetaData(data.file_id, data.file_name, data.file_size, data.file_type, data.chunk_count); break;
			// Receive a file chunk
			case 'receive-chunk' :
				PR2.upload.informChunkReceived(); break;
			// Inform that a donload has completed
			case 'inform-download-completed' :
				PR2.upload.informFileComplete(); break;
		}
	});

	// Get data from a peer and delegate it
	PR2.peer.onWhiteboardData(function(data) {
		data = JSON.parse(data);
		switch (data.type) {
			// Receive a whiteboard property change
			case 'receive-whiteboard-propertychange' :
				handleWhiteboardChange(data.property, data.data); break;
			// Receive whiteboard action
			case 'receive-whiteboard-action' :
				handleWhiteboardMessage(data.action, data.data); break;
			// Receive synchronize whiteboard data
			case 'synchronize' :
				PR2.modals.info('show', 'One moment... The whiteboards are synhronized now');
				PR2.whiteboard.clear();
				synchronizeWhiteboardData(data.data); break;
			case 'synchronization-complete' : PR2.modals.info('hide'); break;
			case 'point' :
				handleWhiteboardRemotePointer(data);
		}
	});	
	
	// Start remote player when it arrives
	PR2.peer.onRemoteStream(function(stream) {
		PR2.camplayer.addRemoteStream(stream);
	});
	
	// Send stream when local stream starts
	PR2.camplayer.onStartLocalStream(function(stream){
		PR2.peer.addStream(stream);
	});
	
	// Send chat message to other peer
	PR2.chatbox.onMessageAdd(function(message) {
		PR2.peer.sendData(JSON.stringify({type : 'receive-chat-message', message : message}));
	});
	
	PR2.camplayer.onFullscreenButtonClick(function() {
		if (PR2.fullscreen.current() == null) {	
			PR2.fullscreen.request('pr2_player_container');
		}
		else {
			PR2.fullscreen.cancel();
		}
	});
	
	// Events fired when a file transfer link is clicked
	PR2.chatbox.onLinkClicked(function(action, file_id) {
		switch (action) {
			case 'revoke-offer' :
				PR2.upload.revokeOffer(file_id); break;
			case 'decline-offer' :
				PR2.download.declineOffer(file_id); break;
			case 'accept-offer' :
				PR2.download.acceptOffer(file_id); break;
			case 'cancel-upload' :
				PR2.upload.cancelFile(file_id); break;
			case 'cancel-download' :
				PR2.download.cancelFile(file_id); break;
		}
	});
	
	// Add file from chat box to the upload list, note that this fires upload.onOfferCreate for each file
	PR2.chatbox.onFilesAdd(function(file_list){
		PR2.upload.addFiles(file_list);
	});
	
	// Whhen offers are created from the upload object send them local and remote
	PR2.upload.onOfferCreate(function(file_id, file_name) {
		PR2.chatbox.addFileOffer(file_id, file_name, 'local');
		sendDataToPeer({type: 'receive-offer', file_id : file_id, file_name: file_name});
	});
	
	// Receive a file offer and it to the chat
	PR2.download.onOfferReceive(function(file_id, file_name) {
		PR2.chatbox.addFileOffer(file_id, file_name, 'remote'); 
	})
	
	// Revoke a file offer and inform remote source
	PR2.upload.onOfferRevoke(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'upload-canceled');
		sendDataToPeer({type : 'revoke-offer', file_id : file_id, file_name : file_name});
	});

	PR2.download.onOfferRevoke(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'download-canceled'); 
	});
	
	// Accept a file offer
	PR2.upload.onOfferAccept(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'upload-waiting');	
	});
	
	PR2.download.onOfferAccept(function(file_id, file_name) {
		sendDataToPeer({type : 'accept-offer', file_id : file_id});
		PR2.chatbox.updateFileStatus(file_id, file_name, 'download-waiting');	
	});
	
	// Decline a file upload
	PR2.upload.onOfferDecline(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'download-canceled');
	});
	
	PR2.download.onOfferDecline(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'upload-canceled');
		sendDataToPeer({type : 'decline-offer', file_id : file_id});
	});
	
	// Cancel a file
	PR2.upload.onFileCancel(function(file_id, file_name, source) {
		if (source == 'local') {
			PR2.chatbox.UpdateFileStatus(file_id, file_name, 'upload-canceled');
			sendDataToPeer({type : 'cancel-upload', file_id : file_id, file_name : file_name});	
		}
		else if (source == 'remote') {
			PR2.chatbox.UpdateFileStatus(file_id, file_name, 'download-canceled');
		}
	});
	
	PR2.download.onFileCancel(function(file_id, file_name, source) {
		if (source == 'local') {
			PR2.chatbox.updateFileStatus(file_id, file_name, 'upload-canceled');
			sendDataToPeer({type : 'cancel-upload', file_id : file_id, file_name : file_name});
		}
		else if (source == 'renote') {
			PR2.chatbox.UpdateFileStatus(file_id, file_name, 'download-canceled');
		}
	});
	
	// Start a file upload (start with sending the file's meta data)
	PR2.upload.onFileStart(function(file_id, file_name, file_size, file_type, chunk_count) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'uploading');
		sendDataToPeer({type : 'start-file', file_id : file_id, file_name : file_name, file_size : file_size, file_type : file_type, chunk_count :chunk_count});
	});
	
	PR2.download.onFileStart(function(file_id, file_name, file_size, file_type, chunk_count) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'downloading');
	});
	
	// Send file chunks to the download object
	PR2.peer.onFileData(function(file_chunk) {
		PR2.download.receiveFileChunk(file_chunk); 
	});
	
	// Send file chunks and update the progress bar
	PR2.upload.onFileProgress(function(file_id, file_chunk, file_progress) {
		PR2.chatbox.updateFileProgress(file_id, file_progress);
		PR2.peer.sendFileData(file_chunk);	
	});

	// Receiver informs senders about reception, intended for controlled file exchange
	PR2.download.onFileProgress(function(file_id, file_progress) {
		PR2.chatbox.updateFileProgress(file_id, file_progress);
		sendDataToPeer({type : 'receive-chunk'}); 
	});

	// File exhchange is complete
	PR2.upload.onFileComplete(function(file_id, file_name) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'upload-completed');
	});
	
	PR2.download.onFileComplete(function(file_id, file_name, object_url) {
		PR2.chatbox.updateFileStatus(file_id, file_name, 'download-completed', object_url);
		sendDataToPeer({type : 'inform-download-completed'}); 
	});
	
	
	
	// Finally, we're there! Open the websocket connection to start PR2!
	Socket.open(user[1], user[0]);

	 
})(credentials);
	
	 
