<?php
require_once('../auth.php');
require_once('LogManager.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/queryPayment') {
        $ret['result'] = "auth";

        // Authenticated
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: query player. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);