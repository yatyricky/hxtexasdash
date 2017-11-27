<?php
require_once('../auth.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
if ($auth['result'] == 'auth') {
    $ret['result'] = "auth";
    $ret['data'] = "secret things";
} else {
    header($ret['header']);
    $ret['result'] = "rejected";
}

echo json_encode($ret);