<?php
require_once('../auth.php');
require_once('LogManager.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/modPlayerStats') {
        $ret['result'] = "auth";

        // Authenticated
        $id = addslashes($_POST['id']);

        $ret['message'] = [];
        if ($id != "") {
            $diamondValue = floor(floatval($_POST['dmd']));
            $chipsValue = floor(floatval($_POST['chips']));
            $ret['message'][] = "操作完成";
            if ($diamondValue > 0) {
                $ret['message'][] = "成功增加：$diamondValue 钻石";
            }
            if ($chipsValue > 0) {
                $ret['message'][] = "成功增加：$chipsValue 筹码";
            }
        } else {
            $ret['message'][] = '请输入玩家ID';
        }
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: mod player. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);