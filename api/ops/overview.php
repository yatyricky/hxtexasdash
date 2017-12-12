<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/overview') {
        $ret['result'] = "auth";

        // Authenticated
        $dateStart = $_POST['start'];
        $dateEnd = $_POST['end'];

        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $dt = $start;

        $data = [];
        $manyDaus = [];

        while ($end >= $dt) {
            $obj = [];
            $obj['date'] = $dt->format('Y-m-d');

            // DAU
            $dau = LogManager::fetchActiveUserIds($obj['date']);
            $obj['dau'] = count($dau);

            // DNU
            $dnu = LogManager::fetchNewUserIds($obj['date']);
            $obj['dnu'] = count($dnu);

            // RR +1 +3 +7 + 15 +30
            $rrDayObj = clone $dt;
            $retentions = [];
            for ($i = 1; $i <= 30; $i++) { 
                $rrDayObj->modify('+1 day');
                $rrDayRep = $rrDayObj->format('Y-m-d');
                if (isset($manyDaus[$rrDayRep]) == false) {
                    $manyDaus[$rrDayRep] = LogManager::fetchActiveUserIds($rrDayRep);
                }
                $intersect = array_intersect($dnu, $manyDaus[$rrDayRep]);
                if ($obj['dnu'] == 0) {
                    $retentions[] = 0;
                } else {
                    $retentions[] = count($intersect) / $obj['dnu'];
                }
            }
            $obj['retentions'] = $retentions;

            // paid accounts
            $paidUsers = LogManager::fetchPaidUsers($obj['date']);
            $revenue = 0;
            $newRevenue = 0;
            $payTimes = 0;
            $newPaid = 0;
            $dnuFlip = array_flip($dnu);
            foreach ($paidUsers as $k => $v) {
                $revenue += $v[0];
                $payTimes += $v[1];
                if (isset($dnuFlip[$k]) == true) {
                    $newPaid ++;
                    $newRevenue += $v[0];
                }
            }
            $obj['pu'] = count($paidUsers); // paid accounts
            $obj['pTimes'] = $payTimes; // payment count
            $obj['pr'] = $obj['dau'] == 0 ? 0 : $obj['pu'] / $obj['dau']; // payment conversion rate
            $obj['revenue'] = $revenue; // total revenue
            $obj['arppu'] = $obj['pu'] == 0 ? 0 : $revenue / $obj['pu']; // arppu
            $obj['narpu'] = $obj['dnu'] == 0 ? 0 : $newRevenue / $obj['dnu']; // new arpu
            $obj['arpu'] = $obj['dau'] == 0 ? 0 : $revenue / $obj['dau']; // arpu
            $obj['newPaid'] = $newPaid; // new paid accounts
            $obj['newRev'] = $newRevenue; // new revenue
            $obj['npr'] = $obj['dnu'] == 0 ? 0 : $newPaid / $obj['dnu']; // new payment conversion rate

            $data[] = $obj;
            $dt->modify('+1 day');
        }

        $ret['data'] = $data;
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: active user. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);