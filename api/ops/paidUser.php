<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/paidUser') {
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
            $newPaid = 0;
            $dnuFlip = array_flip($dnu);
            $dnuCount = count($dnu);
            foreach ($paidUsers as $k => $v) {
                $revenue += $v[0];
                if (isset($dnuFlip[$k]) == true) {
                    $newPaid ++;
                }
            }
            $obj['revenue'] = $revenue;
            $obj['newPaid'] = $newPaid;
            $obj['pu'] = count($paidUsers);
            $obj['pr'] = $dau == 0 ? 0 : $obj['pu'] / $dau;
            $obj['npr'] = $dnuCount == 0 ? 0 : $newPaid / $dnuCount;
            $obj['arpu'] = $dau == 0 ? 0 : $revenue / $dau;
            $obj['arppu'] = $obj['pu'] == 0 ? 0 : $revenue / $obj['pu'];
            $data[] = $obj;

            $dt->modify('+1 day');
        }

        $ret['data'] = $data;
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: paid user. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);
