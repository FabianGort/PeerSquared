<?php 
require('../Pusher.php');
$pusher = new Pusher('ce5e15ae4b2ea6d71902', '24e3586ec6834d116000', '42177');

$user_id = rand(1,4000);
$user_info = array('name' => $_GET["your_name"]);
echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $user_id, $user_info);
?>