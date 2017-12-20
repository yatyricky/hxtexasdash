<?php
require_once('../auth.php');
require_once('LogManager.php');
require_once('../conn.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/newUser') {
        // Authenticated
        $ret['result'] = "auth";
        
        // Get user channels
        $dbhelper = new DBHelper();
        $channels = $dbhelper->retrieveChannels($auth['uid']);
        
        $dateStart = $_POST['start'];
        $dateEnd = $_POST['end'];

        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $dt = $start;

        $dnus = [];
        $sumChannels = [];
        $sumVersions = [];

        while ($end >= $dt) {
            $obj = [];
            $obj['date'] = $dt->format('Y-m-d');
            $obj['data'] = LogManager::fetchRegisterParsed($obj['date'], $channels);
            foreach ($obj['data'] as $k => $v) {
                $sumChannels[$v['channel']] = 1;
                $sumVersions[$v['version']] = 1;
            }

            $dnus[] = $obj;

            $dt->modify('+1 day');
        }

        $ret['data'] = $dnus;
        $ret['channels'] = LogManager::mapChannelConfig(array_keys($sumChannels));
        $ret['versions'] = array_keys($sumVersions);

        unset($dbhelper);
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: new user. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);