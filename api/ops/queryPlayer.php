<?php
require_once('../auth.php');
require_once('LogManager.php');

header('Content-type: application/json');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/queryPlayer') {
        $ret['result'] = "auth";

        // Authenticated
        $id = addslashes($_POST['id']);
        $name = addslashes($_POST['name']);

        $ret['players'] = [];
        if ($id != "") {
            // query with id
            $player = [];
            $player['id'] = $id;
            $player['name'] = '阿娇';
            $player['chips'] = 65535;
            $player['diamonds'] = 127;
            
            $ret['players'][] = $player;
        } else if ($name != "") {
            // query with name
            $player = [];
            $player['id'] = 100001;
            $player['name'] = $name;
            $player['chips'] = 12220;
            $player['diamonds'] = 12;
            $ret['players'][] = $player;

            $player = [];
            $player['id'] = 100001;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;

            $player = [];
            $player['id'] = 100002;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;
            
            $player = [];
            $player['id'] = 100002;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;
            
            $player = [];
            $player['id'] = 100001;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;

            $player = [];
            $player['id'] = 100002;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;
            
            $player = [];
            $player['id'] = 100002;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;
            
            $player = [];
            $player['id'] = 100002;
            $player['name'] = $name;
            $player['chips'] = 500;
            $player['diamonds'] = 6;
            $ret['players'][] = $player;
        }
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: query player. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);