<?php
require_once('./auth.php');

$ret = [];

if ($_POST['do'] == 'login') {
    $auth = authenticate(md5($_POST['code']));
    if ($auth['result'] == 'success') {
        $ret = $auth;
    } else {
        $ret['result'] = "rejected";
    }
} else if ($_POST['do'] == 'auth') {
    $auth = authenticate();
    if ($auth['result'] == 'auth') {
        $ret['result'] = 'success';
    } else {
        $ret['result'] = "rejected";
        $ret['header'] = $auth['header'];
    }
}

// header('Content-type: application/json');
echo json_encode($ret);