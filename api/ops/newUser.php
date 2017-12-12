<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/newUser') {
        $ret['result'] = "auth";

        // Authenticated
        $dateStart = $_POST['start'];
        $dateEnd = $_POST['end'];

        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $dt = $start;

        $dnus = [];

        while ($end >= $dt) {
            $obj = [];
            $obj['date'] = $dt->format('Y-m-d');
            $dnu = LogManager::fetchNewUserIds($obj['date']);
            $obj['dnu'] = count($dnu);
            $dnus[] = $obj;

            $dt->modify('+1 day');
        }

        $ret['data'] = $dnus;
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: new user. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);