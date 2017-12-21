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
        
        $bulk = LogManager::fetchRegisterInPeriodFiltered($_POST['start'], $_POST['end'], $channels);
        $sumChannels = [];
        $sumVersions = [];
        foreach ($bulk as $k => $v) {
            $sumChannels[$v['channel']] = 1;
            $sumVersions[$v['version']] = 1;
        }

        $ret['data'] = $bulk;
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