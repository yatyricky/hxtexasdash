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

    $data = [];

    while ($end >= $dt) {
        $obj = [];
        $obj['date'] = $dt->format('Y-m-d');
        $paidUsers = LogManager::fetchPaidUsers($obj['date']);
        $dnu = LogManager::fetchNewUserIds($obj['date']);
        $dau = count(LogManager::fetchActiveUserIds($obj['date']));

        $revenue = 0;
        $newPaid = count($paidUsers);
        $dnuFlip = array_flip($dnu);
        $dnu = count($dnu);
        foreach ($paidUsers as $k => $v) {
            $tokens = explode(',', $v);
            $revenue += $v[1];
            if (isset($dnuFlip[$v[0]]) == true) {
                $newPaid --;
            }
        }
        $obj['revenue'] = $revenue;
        $obj['newPaid'] = $newPaid;
        $obj['pu'] = count($paidUsers);
        $obj['pr'] = $dau == 0 ? 0 : $obj['pu'] / $dau;
        $obj['npr'] = $dnu == 0 ? 0 : $newPaid / $dnu;
        $obj['arpu'] = $dau == 0 ? 0 : $revenue / $dau;
        $obj['arppu'] = $obj['pu'] == 0 ? 0 : $revenue / $obj['pu'];
        $data[] = $obj;

        $dt->modify('+1 day');
    }

    $ret['data'] = $data;
} else {
    header($ret['header']);
    $ret['result'] = "rejected";
}

echo json_encode($ret);
