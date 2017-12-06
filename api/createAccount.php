<?php
require_once('auth.php');
require_once('conn.php');
header('Content-type: application/json');

$ret = [];
$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    // Authenticated
    $uname = addslashes($_POST['name']);
    $upass = password_hash(addslashes($_POST['code']), PASSWORD_DEFAULT);
    $ugroup = addslashes($_POST['ugroup']);
    
    $dbhelper = new DBHelper();
    $link = $dbhelper->conn;
    $query = "INSERT INTO `user` (`id`, `username`, `encpass`, `usergroup`) VALUES (NULL, '$uname', '$upass', '$ugroup')";
    $result = mysqli_query($link, $query);
    $affected = mysqli_affected_rows($link);
    if ($affected > 0) {
        $ret['message'] = "Successfully inserted $affected record";
    } else {
        $ret['message'] = 'User already exists';
        $header = 'HTTP/1.0 400 Bad Request';
    }
    unset($dbhelper);
}

header($header);
echo json_encode($ret);