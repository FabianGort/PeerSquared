<?php 
require('Pusher.php');
// you get your own app key, secret and id, by creating an account at pusher.com
$pusher = new Pusher('3cf3c7ca0b7957dece97', '89ebd8a6972d5b24befa', 123356);

$user_id = rand(1,4000);
$user_info = array('name' => $_GET["your_name"]);
echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $user_id, $user_info);

?>
