<?php
require_once('../auth.php');
require_once('LogManager.php');

header('Content-type: application/json');

$c = new Zend\Config\Config(include '../config.php');

$ret = [];

$auth = authenticate();
if ($auth['result'] == 'auth') {
    $ret['result'] = "auth";

    // Authenticated
    $dateStart = $_POST['start'];
    $dateEnd = $_POST['end'];

    $start = new DateTime($dateStart);
    $end = new DateTime($dateEnd);
    $dt = $start;

    $allChips = [];
    $allChipsLines = LogManager::fetchTotalChips();
    foreach ($allChipsLines as $k => $v) {
        $tokens = explode('|', $v);
        $allChips[$tokens[$c->TOTAL_CHIPS_DATE_INDEX]] = $tokens[$c->TOTAL_CHIPS_SUM_INDEX];
    }

    $datum = [];

    while ($end >= $dt) {
        $obj = [];
        $obj['date'] = $dt->format('Y-m-d');

        // sum chips 
        $sum = $allChips[$obj['date']] ?? 0;
        $obj['sum'] = $sum;

        // diamonds exchange
        $diamondsExchangeSum = 0;
        $gmChangeSum = 0;
        $buyItem = 0;
        $pc = LogManager::fetchPropertyChange($obj['date']);
        foreach ($pc as $k => $v) {
            $tokens = explode('|', $v);
            if ($tokens[$c->PROPERTY_CHANGE_TYPE_INDEX] == $c->PROPERTY_CHANGE_TYPE_CHIPS) {
                if ($tokens[$c->PROPERTY_CHANGE_REASON_INDEX] == $c->PROPERTY_CHANGE_REASON_DIAMOND) {
                    $diamondsExchangeSum += $tokens[$c->PROPERTY_CHANGE_DELTA_INDEX];
                }
                if ($tokens[$c->PROPERTY_CHANGE_REASON_INDEX] == $c->PROPERTY_CHANGE_REASON_GM) {
                    $gmChangeSum += $tokens[$c->PROPERTY_CHANGE_DELTA_INDEX];
                }
                if ($tokens[$c->PROPERTY_CHANGE_REASON_INDEX] == $c->PROPERTY_CHANGE_REASON_PURCHASE) {
                    $buyItem += $tokens[$c->PROPERTY_CHANGE_DELTA_INDEX];
                }
            }
        }
        $obj['dmd'] = $diamondsExchangeSum;
        $obj['gm'] = $gmChangeSum;
        $obj['buyItem'] = $buyItem;

        $pr = LogManager::fetchPokerResult($obj['date']);
        $pot = 0;
        $win = 0;
        foreach ($pr as $k => $v) {
            $tokens = explode('|', $v);
            $players = explode(';', $tokens[$c->POKER_RESULT_PLAYERS_INDEX]);
            foreach ($players as $kk => $vv) {
                $ptokens = explode(':', $vv);
                $pot += $ptokens[$c->POKER_RESULT_PLAYERS_BET_INDEX];
                $win += $ptokens[$c->POKER_RESULT_PLAYERS_WIN_INDEX];
            }
        }
        $obj['rake'] = $pot - $win;

        $datum[] = $obj;
        $dt->modify('+1 day');
    }

    $ret['data'] = $datum;
} else {
    $ret['result'] = "rejected";
}

header($auth['header']);
echo json_encode($ret);