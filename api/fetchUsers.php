<?php
require_once('auth.php');
require_once('conn.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/account') {
        $ret['result'] = "auth";

        // Authenticated
        $dbhelper = new DBHelper();
        $link = $dbhelper->conn;
        $query = "SELECT `id`,`username`,`usergroup`,`channels` FROM `user`";
        $result = mysqli_query($link, $query);
        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $config = new Zend\Config\Config(include 'config.php');
        foreach ($rows as $k => &$v) {
            $v['channels'] = explode(",", $v['channels']);
        }
        unset($dbhelper);
        $ret['data']['users'] = $rows;
        $ret['data']['chnconf'] = $config->CHANNELS->toArray();
        $ret['data']['ugconf'] = $config->PERMDEFS->toArray();
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: Account. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);