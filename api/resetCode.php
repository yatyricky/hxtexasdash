<?php
require_once('auth.php');
require_once('conn.php');
header('Content-type: application/json');

$ret = [];
$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    // Authenticated
    $id = intval($_POST['id']);
    $pass = '$2y$10$bw46GWq53zuieeseDu6Oeuxk.CrL8kX6LeLJFSnYWw6hpVnzUchJu';
    
    $dbhelper = new DBHelper();
    $link = $dbhelper->conn;
    $query = "UPDATE `user` SET `encpass` = '$pass' WHERE `user`.`id` = $id";
    $result = mysqli_query($link, $query);
    $affected = mysqli_affected_rows($link);
    if ($affected == 1) {
        $ret['message'] = "Successfully updated $affected record";
    } else {
        $ret['message'] = 'Nothing has changed or invalid user id';
        $header = 'HTTP/1.0 400 Bad Request';
    }
    unset($dbhelper);
}

header($header);
echo json_encode($ret);