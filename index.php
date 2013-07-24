<!DOCTYPE html>
<head>
<meta charset="utf-8"> 
 <script src="script/util.js"></script>
 
 <link rel="stylesheet" href="css/canvas.css" />
 <title>PeerSquared - Login</title>
 <style>
body {
	font-family: Arial;
}

#login_screen {
	height: 200px;
	width: 350px;
	line-height: 40px;
	position: relative; 
	margin-top: 100px;
	margin-left: auto;
	margin-right: auto;
	background-color:  #eaffea;
	padding: 20px;
	border: solid #339933 1px;
	border-radius: 4px;
	box-shadow: 5px 5px 5px #575757;
	background: -moz-linear-gradient(top, #f8ffe8 0%, #e3f5ab 33%, #b7df2d 100%); /* FF3.6+ */
	background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#f8ffe8), color-stop(33%,#e3f5ab), color-stop(100%,#b7df2d)); /* Chrome,Safari4+ */
	background: -webkit-linear-gradient(top, #f8ffe8 0%,#e3f5ab 33%,#b7df2d 100%); /* Chrome10+,Safari5.1+ */
}

label { 
	display: inline-block;
	font-weight: bold;
	width: 130px;
}

input {
	border: solid #339933 1px;
	border-radius: 4px;
	padding: 1px 4px 1px;
}
span {
	border: dashed green 1px;
	display: inline-block;
	line-height: 14px;
	padding: 4px;
}

button {
	position: relative;
	display: block;
	margin-left: auto;
	margin-right: auto;
}
 </style>
</head>
<body>

	<div id="login_screen" action="test.php"> 
	 <span>Note that student and teacher must fill in the same room name</span>
	 <label>Your Name</label><input type="text" id="your_name"> <br />
	 <label>Room Name</label><input type="text" id="room_name"> <br />
	 <label>Login as</label><input type="radio" name="position" id="teacher">Teacher &nbsp;<input type="radio" name="position">Student <br />
	 <button>Log In</button>
	</div>


<script>

document.getElementsByTagName('button')[0].addEventListener('click', function() {
	var position = document.getElementsByName('position');
 
	if(el('your_name').value.length == 0) {
		el('your_name').focus();
		alert('Please fill in your name');
		return false;
	}
	else if(el('room_name').value.length == 0) {
		el('room_name').focus();
		alert('Please fill in a room name');
		return false;
	}
	else if(position[0].checked == false && position[1].checked == false) {
		alert('Please select Teacher or Student');
		return false;
	}
	else {
		if(position[0].checked) {
			document.location = 'teacher.php?your_name=' + el('your_name').value + '&room_name=' + el('room_name').value;
		}
		else {
			document.location = 'student.php?your_name='  + el('your_name').value + '&room_name=' + el('room_name').value;
		}
	}
});

</script>

</body>
</html>