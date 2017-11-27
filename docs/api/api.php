<?php
require_once('../../api/auth.php');

$auth = authenticate();
$ret = [];

if ($auth['result'] == 'auth') {
    $ret['result'] = "success";
    $directory = '../docs';
    $scannedDirectory = array_diff(scandir($directory), array('..', '.'));

    $ret['all'] = $scannedDirectory;

    $ret['contents'] = '# Hello :)';

    $post = urldecode($_POST['postTitle']).'.md';
    if (in_array($post, $scannedDirectory)) {
        $ret['contents'] = file_get_contents($directory.DIRECTORY_SEPARATOR.$post);
    }
} else {
    $ret['result'] = "rejected";
    $ret['header'] = $auth['header'];
}

echo json_encode($ret);