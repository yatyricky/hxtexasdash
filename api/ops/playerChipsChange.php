<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
// $auth['result'] = 'auth';
if ($auth['result'] == 'auth') {
    $ret['result'] = "auth";

    $dateStart = $_POST['start'];
    $dateEnd = $_POST['end'];
    $playerId = $_POST['pid'];

    // $dateStart = '2017-11-01';
    // $dateEnd = '2017-11-30';
    // $playerId = '1000009';

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
    $ret['result'] = "rejected";
}

header($auth['header']);
echo json_encode($ret);
