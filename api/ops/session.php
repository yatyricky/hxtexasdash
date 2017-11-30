<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
// $auth['result'] = 'auth';
if ($auth['result'] == 'auth') {
    $ret['result'] = "auth";

    // Authenticated
    $dateStart = $_POST['start'];
    $dateEnd = $_POST['end'];
    // $dateStart = '2017-11-05';
    // $dateEnd = '2017-11-07';

    $start = new DateTime($dateStart);
    $end = new DateTime($dateEnd);
    $dt = $start;

    $data = [];
    $sessionLengths = [];

    while ($end >= $dt) {
        $obj = [];
        $obj['date'] = $dt->format('Y-m-d');
        
        $logins = LogManager::fetchLogins($obj['date']);
        $logouts = LogManager::fetchLogouts($obj['date']);

        $sessionLength = [];
        $startOfToday =  strtotime($dt->format('Y-m-d'));

        $loginInfo = [];
        foreach ($logins as $k => $v) {
            $tokens = explode('|', LogManager::remove_utf8_bom($v));
            $id = $tokens[1];
            $time = trim($tokens[0]);
            if (!isset($loginInfo[$id])) {
                $loginInfo[$id] = [];
            }
            $loginInfo[$id][] = $time;
        }

        foreach ($logouts as $k => $v) {
            $tokens = explode('|', LogManager::remove_utf8_bom($v));
            $id = $tokens[1];
            $time = $tokens[0];

            if (isset($loginInfo[$id])) {
                $earliestLogin = array_shift($loginInfo[$id]);
                if ($earliestLogin) {
                    $currentSession = strtotime($time) - strtotime($earliestLogin);
                } else {
                    $currentSession = strtotime($time) - $startOfToday;
                }
            } else {
                // only logout, no login
                $currentSession = strtotime($time) - $startOfToday;
            }

            if ($currentSession < 0) {
                $sessionLength[] = 86400 - strtotime($earliestLogin) + $startOfToday;
                $sessionLength[] = strtotime($time) - $startOfToday;
            } else {
                $sessionLength[] = $currentSession;
            }
        }

        foreach ($loginInfo as $k => $v) {
            while ($leftOver = array_shift($v)) {
                $leftOverSeconds = 86400 - strtotime($leftOver) + $startOfToday;
                $sessionLength[] = $leftOverSeconds;
            }
        }

        $sum = array_sum($sessionLength);
        $num = count($sessionLength);
        $avg = $num == 0 ? 0 : $sum / $num;

        $obj['session'] = $num;
        $obj['avgLength'] = $avg;
        $obj['sum'] = $sum;

        $data[] = $obj;
        $dt->modify('+1 day');
    }

    $ret['data'] = $data;
} else {
    header($ret['header']);
    $ret['result'] = "rejected";
}

// echo json_encode($ret, JSON_PRETTY_PRINT);
echo json_encode($ret);