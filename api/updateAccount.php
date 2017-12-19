<?php
require_once('auth.php');
require_once('conn.php');
header('Content-type: application/json');

$ret = [];
$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    // Authenticated
    $id = intval($_POST['id']);
    $ugroup = addslashes($_POST['ugroup']);
    
    // validate passed data
    $config = new Zend\Config\Config(include 'config.php');
    $ugconf = $config->PERMDEFS->toArray();
    if (isset($ugconf[$ugroup])) {
        $tampered = -1;
        $uchannels = addslashes($_POST['uchannels']);
        if ($uchannels != "") {
            $chnTokens = explode(",", $uchannels);
            $chnConf = $config->CHANNELS->toArray();
            foreach ($chnTokens as $k => $v) {
                if (isset($chnConf[$v]) == false) {
                    $tampered = 1;
                    break;
                }
            }
        }
        if ($tampered == -1) {
            // post data all good
            $dbhelper = new DBHelper();
            $link = $dbhelper->conn;
            if ($_POST['code'] == "") {
                $query = "UPDATE `user` SET `usergroup` = '$ugroup', `channels` = '$uchannels' WHERE `user`.`id` = $id";
            } else {
                $encpass = password_hash(addslashes($_POST['code']), PASSWORD_DEFAULT);
                $query = "UPDATE `user` SET `encpass` = '$encpass', `usergroup` = '$ugroup', `channels` = '$uchannels' WHERE `user`.`id` = $id";
            }
            $result = mysqli_query($link, $query);
            $affected = mysqli_affected_rows($link);
            if ($affected == 1) {
                $ret['message'] = "Successfully updated $affected record";
            } else {
                $ret['message'] = 'Nothing has changed or invalid user id';
                $header = 'HTTP/1.0 400 Bad Request';
            }
            unset($dbhelper);
        } else {
            $ret['message'] = 'Post data: user channel tampered';
            $header = 'HTTP/1.0 400 Bad Request';
        }
    } else {
        $ret['message'] = 'Post data: user group tampered';
        $header = 'HTTP/1.0 400 Bad Request';
    }
    

}

header($header);
echo json_encode($ret);