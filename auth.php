<?php 
require('Pusher.php');
// you get your own app key, secret and id, by creating an account at pusher.com
$pusher = new Pusher(APP_KEY, APP_SECRET, APP_ID);

$user_id = rand(1,4000);
$user_info = array('name' => $_GET["your_name"]);
echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $user_id, $user_info);

?>
