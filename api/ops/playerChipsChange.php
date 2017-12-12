<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/playerChipsChange') {
        $ret['result'] = "auth";

        $dateStart = $_POST['start'];
        $dateEnd = $_POST['end'];
        $playerId = $_POST['pid'];

        if ($dateStart != '') {
            $start = new DateTime($dateStart);
            $end = new DateTime($dateEnd);

            $dt = $start;

            // start the date loop
            $allLogs = [];
            while ($end >= $dt) {
                $dailyLog = LogManager::fetchPropertyChange($dt->format('Y-m-d'));
                foreach ($dailyLog as $k => $v) {
                    $tokens = explode('|', $v);
                    $id = $tokens[1];
                    if (!isset($allLogs[$id])) {
                        $allLogs[$id] = [];
                    }
                    $allLogs[$id][] = $tokens;
                }
                $dt->modify('+1 day');
            }
            if (isset($allLogs[$playerId])) {
                $ret['data'] = $allLogs[$playerId];
            } else {
                $ret['data'] = [];
            }
        } else {
            $ret['data'] = [];
        }
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: player chips change. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);
