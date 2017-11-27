<?php
class LogManager {

    public static function fetchNewUserIds($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $fPath = $config->rootDir.DIRECTORY_SEPARATOR.'register'.DIRECTORY_SEPARATOR.$date.'_accountID.txt';
        if (file_exists($fPath)) {
            $arr = file($fPath, FILE_IGNORE_NEW_LINES);
        } else {
            $rawPath = $config->rootDir.DIRECTORY_SEPARATOR.'register'.DIRECTORY_SEPARATOR.$date.'.txt';
            if (file_exists($rawPath)) {
                $keySet = [];
                $lines = file($rawPath, FILE_IGNORE_NEW_LINES);
                for ($i = 0, $n = count($lines); $i < $n; $i++) { 
                    $playerId = explode('|', trim($lines[$i]))[1];
                    if (isset($keySet[$playerId]) == false) {
                        $keySet[$playerId] = 1;
                    }
                }
                $arr = array_keys($keySet);
                file_put_contents($fPath, join(PHP_EOL, $arr), LOCK_EX);
            } else {
                $arr = [];
            }
        }
        return $arr;
    }

}
