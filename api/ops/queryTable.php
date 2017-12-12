<?php
require_once('../auth.php');
require_once('LogManager.php');

header('Content-type: application/json');

$c = new Zend\Config\Config(include '../config.php');

$ret = [];

$auth = authenticate();
$header = $auth['header'];
if ($auth['result'] == 'auth') {
    if ($auth['view'] == '/queryTable') {
        $ret['result'] = "auth";

        // Authenticated
        $dateStart = $_POST['start'];
        $dateEnd = $_POST['end'];
        $roomId = $_POST['rid'];
        $playerId = $_POST['pid'];

        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $dt = $start;

        $datum = [];

        while ($end >= $dt) {
            $day = $dt->format('Y-m-d');
            
            $pr = LogManager::fetchPokerResult($day);
            foreach ($pr as $k => $v) {
                $tokens = explode('|', $v);
                $matchRoom = $roomId == "" ? true : $roomId == $tokens[$c->POKER_RESULT_ROOM_INDEX];
                $matchPlayer = $playerId == "" ? true : preg_match("/\b$playerId\b/", $tokens[$c->POKER_RESULT_PLAYERS_INDEX]);
                if ($matchRoom && $matchPlayer) {
                    $obj = [];
                    $obj['date'] = $tokens[$c->POKER_RESULT_DATE_INDEX];
                    $obj['roomId'] = $tokens[$c->POKER_RESULT_ROOM_INDEX];
                    $obj['commc'] = $tokens[$c->POKER_RESULT_COMM_INDEX];
                    $obj['button'] = $tokens[$c->POKER_RESULT_BUTTON_INDEX];
                    $obj['sb'] = $tokens[$c->POKER_RESULT_SB_INDEX];
                    $obj['end'] = $tokens[$c->POKER_RESULT_END_INDEX];

                    $players = [];
                    $playerRaws = explode(';', $tokens[$c->POKER_RESULT_PLAYERS_INDEX]);
                    foreach ($playerRaws as $kk => $vv) {
                        $ptokens = explode(':', $vv);
                        $player = [];
                        $player['id'] = $ptokens[$c->POKER_RESULT_PLAYERS_ID_INDEX];
                        $player['hand'] = $ptokens[$c->POKER_RESULT_PLAYERS_HAND_INDEX];
                        $player['bet'] = $ptokens[$c->POKER_RESULT_PLAYERS_BET_INDEX];
                        $player['win'] = $ptokens[$c->POKER_RESULT_PLAYERS_WIN_INDEX];
                        $players[] = $player;
                    }

                    $obj['players'] = $players;
                    $datum[] = $obj;
                }
            }

            $dt->modify('+1 day');
        }

        $ret['data'] = $datum;
    } else {
        $header = 'HTTP/1.0 400 Bad Request';
        $ret['result'] = "Original post data was altered.";
    }
} else {
    $ret['result'] = "Rejected: query table. Auth: ".$auth['result'];
}

header($header);
echo json_encode($ret);