<?php 
require('../Pusher.php');
$pusher = new Pusher($key, $secret, $app_id);

$user_id = rand(1,4000);
$user_info = array('name' => $_GET["your_name"]);
echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $user_id, $user_info);
?>
