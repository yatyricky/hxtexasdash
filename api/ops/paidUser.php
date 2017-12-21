<?php
require_once('../auth.php');
require_once('LogManager.php');
require_once('../conn.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/paidUser') {
        // Authenticated
        $ret['result'] = "auth";

        // Get user channels
        $dbhelper = new DBHelper();
        $channels = $dbhelper->retrieveChannels($auth['uid']);

        $bulkPayment = LogManager::fetchPaymentsInPeriodFiltered($_POST['start'], $_POST['end'], $channels);
        $bulkNewUser = LogManager::fetchRegisterInPeriodFiltered($_POST['start'], $_POST['end'], $channels);
        $bulkActUser = LogManager::fetchActiveUserInPeriodFiltered($_POST['start'], $_POST['end'], $channels);

        $sumChannels = [];
        foreach ($bulkPayment as $k => $v) {
            $sumChannels[$v['channel']] = 1;
        }

        $ret['dataP'] = $bulkPayment;
        $ret['dataN'] = $bulkNewUser;
        $ret['dataA'] = $bulkActUser;
        $ret['channels'] = LogManager::mapChannelConfig(array_keys($sumChannels));

        // free db connection
        unset($dbhelper);
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: paid user. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);
