<?php
require_once('./auth.php');

header('Content-type: application/json');

$auth = authenticate();
header($auth['header']);