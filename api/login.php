<?php
require_once('./auth.php');
header('Content-type: application/json');

$ret = [];

function getAccess($ugroup) {
    $config = new Zend\Config\Config(include 'config.php');
    $pagesAllowed = $config->PERMISSIONS->$ugroup->toArray();
    $fpagesAllowed = array_flip($pagesAllowed);
    $menu = array(
        'user' => array(
            "category" => "用户分析",
            "options" => []
        ),
        'retn' => array(
            "category" => "留存分析",
            "options" => []
        ),
        'paym' => array(
            "category" => "付费分析",
            "options" => []
        ),
        'gdta' => array(
            "category" => "游戏数据",
            "options" => []
        ),
        'opts' => array(
            "category" => "运营工具",
            "options" => []
        )
    );
    if (isset($fpagesAllowed['/overview'])) {$menu['user']['options'][] = array("text" => "总览", "to" => "overview");}
    if (isset($fpagesAllowed['/newUser'])) {$menu['user']['options'][] = array("text" => "新增用户", "to" => "newUser");}
    if (isset($fpagesAllowed['/activeUser'])) {$menu['user']['options'][] = array("text" => "活跃用户", "to" => "activeUser");}
    if (isset($fpagesAllowed['/paidUser'])) {$menu['user']['options'][] = array("text" => "付费用户", "to" => "paidUser");}
    if (isset($fpagesAllowed['/session'])) {$menu['user']['options'][] = array("text" => "启动次数", "to" => "session");}
    if (isset($fpagesAllowed['/currentOnline'])) {$menu['user']['options'][] = array("text" => "在线情况", "to" => "currentOnline");}
    if (isset($fpagesAllowed['/playerRetention'])) {$menu['retn']['options'][] = array("text" => "留存率", "to" => "playerRetention");}
    if (isset($fpagesAllowed['/paymentRanking'])) {$menu['paym']['options'][] = array("text" => "付费排行榜", "to" => "paymentRanking");}
    if (isset($fpagesAllowed['/totalChips'])) {$menu['gdta']['options'][] = array("text" => "库存变化", "to" => "totalChips");}
    if (isset($fpagesAllowed['/playerChipsChange'])) {$menu['gdta']['options'][] = array("text" => "玩家筹码变动", "to" => "playerChipsChange");}
    if (isset($fpagesAllowed['/queryPlayer'])) {$menu['opts']['options'][] = array("text" => "查询玩家", "to" => "queryPlayer");}
    if (isset($fpagesAllowed['/modPlayerStats'])) {$menu['opts']['options'][] = array("text" => "修改玩家属性", "to" => "modPlayerStats");}
    if (isset($fpagesAllowed['/queryPayment'])) {$menu['opts']['options'][] = array("text" => "查询订单", "to" => "queryPayment");}
    if (isset($fpagesAllowed['/queryTable'])) {$menu['opts']['options'][] = array("text" => "查询牌桌", "to" => "queryTable");}
    if (isset($fpagesAllowed['/eventConfig'])) {$menu['opts']['options'][] = array("text" => "活动配置", "to" => "eventConfig");}

    foreach ($menu as $k => $v) {
        if (count($v['options']) == 0) {
            unset($menu[$k]);
        }
    }
    $newMenu = [];
    foreach ($menu as $k => $v) {
        $newMenu[] = $v;
    }
    return $newMenu;
}

if ($_POST['do'] == 'login') {
    $auth = authenticate($_POST['name'], $_POST['code']);
    if ($auth['result'] == 'success') {
        $ret['result'] = 'success';
        $ret['jwt'] = $auth['jwt'];
        $ret['access'] = getAccess($auth['ugroup']);
        $header = 'HTTP/1.0 200 OK';
    } else {
        $ret['result'] = "Rejected: login denied";
        $header = 'HTTP/1.0 401 Unauthorized';
    }
} else if ($_POST['do'] == 'auth') {
    $auth = authenticate();
    if ($auth['result'] == 'auth') {
        $ret['access'] = getAccess($auth['ugroup']);
        $header = 'HTTP/1.0 200 OK';
    } else {
        $ret['result'] = "Rejected: authenticator returned false";
        $header = 'HTTP/1.0 401 Unauthorized';
    }
} else {
    $header = 'HTTP/1.0 400 Bad Request';
}

header($header);
echo json_encode($ret);