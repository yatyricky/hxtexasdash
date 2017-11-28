<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
if ($auth['result'] == 'auth') {
    $ret['result'] = "auth";

    // Authenticated
    $dateStart = $_POST['start'];
    $dateEnd = $_POST['end'];

    $start = new DateTime($dateStart);
    $end = new DateTime($dateEnd);
    $dt = $start;

    $daus = [];

    while ($end >= $dt) {
        $obj = [];
        $obj['date'] = $dt->format('Y-m-d');
        $dau = LogManager::fetchLogins($obj['date']);
        $obj['dau'] = count($dau);
        $daus[] = $obj;

        $dt->modify('+1 day');
    }

    $ret['data'] = $daus;
} else {
    header($ret['header']);
    $ret['result'] = "rejected";
}

echo json_encode($ret);