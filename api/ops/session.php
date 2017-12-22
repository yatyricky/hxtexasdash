<?php
require_once('../auth.php');
require_once 'LogManager.php';

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/session') {
        // Authenticated
        $ret['result'] = "auth";

        // Get user channels
        $dbhelper = new DBHelper();
        $channels = $dbhelper->retrieveChannels($auth['uid']);

        $bulkLogin = LogManager::fetchLogWithinPeriodFiltered(
            $_POST['start'],
            $_POST['end'],
            $channels,
            "login",
            array(
                'timeStamp' => 0,
                'userId' => 1,
                'version' => 3,
                'channel' => 4
            )
        );

        $bulkLogout = LogManager::fetchLogWithinPeriodFiltered(
            $_POST['start'],
            $_POST['end'],
            $channels,
            "logout",
            array(
                'timeStamp' => 0,
                'userId' => 1,
                'version' => 3,
                'channel' => 4
            )
        );

        $sumChannels = [];
        $sumVersions = [];
        foreach ($bulkLogin as $k => $v) {
            $sumChannels[$v['channel']] = 1;
            $sumVersions[$v['version']] = 1;
        }
        foreach ($bulkLogout as $k => $v) {
            $sumChannels[$v['channel']] = 1;
            $sumVersions[$v['version']] = 1;
        }

        $ret['dataI'] = $bulkLogin;
        $ret['dataO'] = $bulkLogout;
        $ret['channels'] = LogManager::mapChannelConfig(array_keys($sumChannels));
        $ret['versions'] = array_keys($sumVersions);

        unset($dbhelper);
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: session. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);