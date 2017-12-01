<?php
require_once('./auth.php');

header('Content-type: application/json');

$ret = [];

if ($_POST['do'] == 'login') {
    $auth = authenticate(md5($_POST['code']));
    if ($auth['result'] == 'success') {
        $ret['result'] = 'success';
        $ret['jwt'] = $auth['jwt'];
        $header = 'HTTP/1.0 200 OK';
    } else {
        $ret['result'] = "rejected";
        $header = 'HTTP/1.0 401 Unauthorized';
    }
} else if ($_POST['do'] == 'auth') {
    $auth = authenticate();
    if ($auth['result'] == 'auth') {
        $ret['result'] = 'success';
        $header = 'HTTP/1.0 200 OK';
    } else {
        $ret['result'] = "rejected";
        $header = 'HTTP/1.0 401 Unauthorized';
    }
} else {
    $header = 'HTTP/1.0 400 Bad Request';
}

header($header);
echo json_encode($ret);