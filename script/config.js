// Optionally use a custom confifuration object to set up PR2
 
var config = {
	canvas : {
		"canvasWidth" : 1000, // numeric value that sets the canvas width
		"canvasHeight" : 660, // numeric value that sets the canvas height
		"strokeColor" : "black", // color value that initializes the canvas stroke color
		"fontFamily" : "Verdana", // font type value that initializes the canvas text font 
		"fontSize" : "14px", // pixel value that initializes the canvas text size
		"strokeWidth" : 1, // numeric value that initializes the canvas stroke color
		"action": "paint", // string value that initializes the action, allowed are: 'paint', 'point', 'shape' and 'write'
		"shape" : "line" // string value that initializes the canvas stroke color
 
	},
	colors : ['Khaki', 'Yellow', 'Gold', 'Orange', 'Goldenrod', 'Lightgreen', 'Greenyellow', 'Lime', 'Green', 'Darkgreen', 'Orchid', 'Fuchsia', 'Hotpink', 'Blueviolet', 'Indigo', 'Salmon', 'Crimson', 'Firebrick', 'Red', 'Darkred', 'Cyan', 'Dodgerblue', 'Lightseagreen', 'Blue', 'Mediumblue', 'Tan', 'Peru', 'Chocolate', 'Saddlebrown', 'Brown',  'White', 'Lightgrey', 'Darkgray', 'Gray', 'Black'],
	widths : [1, 2, 5, 7, 10, 15],
	fonts : ['Arial','Avant Garde', 'Bookman', 'Calibri' , 'Comic Sans MS', 'Courier', 'Georgia', 'Impact', 'Lucida Console', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
	fontSizes : ['8px', '10px', '12px', '14px', '16px', '18px', '24px', '32px', '40px', '48px', '72px'],
	// background images must reside in the '/backgrounds' directory relatively to the PR2 parent directory
	canvas_backgrounds : [
		{"descr" : "Simply white", "image" : "simply-white.png", "type" : "repeat"},
		{"descr" : "Low contrast", "image" : "low-contrast.png", "type" : "repeat"},		
		{"descr" : "Medium blocked grid", "image" : "block-grid-medium.png", "type" : "repeat"},
		{"descr" : "Small blocked grid", "image" : "block-grid-small.png", "type" : "repeat"},
		{"descr" : "Large blocked grid", "image" : "block-grid-large.png", "type" : "repeat"},
		{"descr" : "Writing paper", "image" : "writing-paper.png", "type" : "repeat"},
		{"descr" : "Grid of dots", "image" : "dots.png", "type" : "repeat"},
		{"descr" : "Medium inverted grid", "image" : "block-grid-medium-invert.png", "type" : "repeat"},
		{"descr" : "School Board", "image" : "school-board.png", "type" : "repeat"},
		{"descr" : "School Board grid", "image" : "school-board-grid.png", "type" : "repeat"} 		    
	],
	key_codes : [
		{"key": 87, "action": function() { PR2.setAction('write'); }}, 
		{"key": 68, "action": function() { PR2.setAction('draw'); }},
		{"key": 83, "action": function() { PR2.setAction('shape'); }},
		{"key": 69, "action": function() { PR2.setAction('point'); }},
		{"key": 90, "action": function() { PR2.undo() }}
	]
}
