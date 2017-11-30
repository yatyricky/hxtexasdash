<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');
$resp = [];

$auth = authenticate();
if ($auth['result'] == 'auth') {
    $resp['result'] = 'auth';

    $dateStart = $_POST['start'];
    $dateEnd = $_POST['end'];

    $start = new DateTime($dateStart);
    $end = new DateTime($dateEnd);
    $dt = $start;

    $dau = [];
    $ret = [];

    while ($end >= $dt) {
        $obj = [];
        $obj['date'] = $dt->format('Y-m-d');

        $dnu = LogManager::fetchNewUserIds($obj['date']);

        $obj['dnu'] = count($dnu);

        $rrDayObj = clone $dt;

        $retentions = [];
        for ($i = 1; $i <= 30; $i++) { 
            $rrDayObj->modify('+1 day');
            $rrDayRep = $rrDayObj->format('Y-m-d');
            if (isset($dau[$rrDayRep]) == false) {
                $dau[$rrDayRep] = LogManager::fetchActiveUserIds($rrDayRep);
            }
            $intersect = array_intersect($dnu, $dau[$rrDayRep]);
            if ($obj['dnu'] == 0) {
                $retentions[] = 0;
            } else {
                $retentions[] = count($intersect) / $obj['dnu'];
            }
        }

        $obj['retentions'] = $retentions;
        $ret[] = $obj;

        $dt->modify('+1 day');
    }

    $resp['data'] = $ret;
} else {
    $resp['result'] = "rejected";
}

header($auth['header']);
echo json_encode($resp);