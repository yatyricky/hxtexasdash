<?php
class LogManager {

    function remove_utf8_bom($text) {
        $bom = pack('H*','EFBBBF');
        $text = preg_replace("/^$bom/", '', $text);
        return $text;
    }

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

    public static function fetchActiveUserIds($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $fPath = $config->rootDir.DIRECTORY_SEPARATOR.'daily_active_users'.DIRECTORY_SEPARATOR.$date.'.txt';
        if (file_exists($fPath)) {
            $arr = file($fPath, FILE_IGNORE_NEW_LINES);
        } else {
            $tempSet = [];

            $rawLoginPath = $config->rootDir.DIRECTORY_SEPARATOR.'login'.DIRECTORY_SEPARATOR.$date.'.txt';
            if (file_exists($rawLoginPath)) {
                $lines = file($rawLoginPath, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $k => $v) {
                    $tokens = explode('|', $v);
                    if (isset($tempSet[$tokens[1]]) == false) {
                        $tempSet[$tokens[1]] = 1;
                    }
                }
            }

            $rawLogoutPath = $config->rootDir.DIRECTORY_SEPARATOR.'logout'.DIRECTORY_SEPARATOR.$date.'.txt';
            if (file_exists($rawLogoutPath)) {
                $lines = file($rawLogoutPath, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $k => $v) {
                    $tokens = explode('|', $v);
                    if (isset($tempSet[$tokens[1]]) == false) {
                        $tempSet[$tokens[1]] = 1;
                    }
                }
            }

            $arr = array_keys($tempSet);
            if (count($arr) > 0) {
                file_put_contents($fPath, join(PHP_EOL, $arr), LOCK_EX);
            }
        }
        return $arr;
    }

    /**
     * return:
     *  {
     *      'player_id_1': [total_value, payment_times],
     *      'player_id_2': [total_value, payment_times],
     *      'player_id_3': [total_value, payment_times],
     *  }
     * 
     * stores:
     *  player_id_1,total_value,payment_times
     *  player_id_2,total_value,payment_times
     *  player_id_3,total_value,payment_times
     */
    public static function fetchPaidUsers($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $cachePath = $config->rootDir.DIRECTORY_SEPARATOR.'payment'.DIRECTORY_SEPARATOR.$date.'_payment.txt';

        if (file_exists($cachePath)) {
            $lines = file($cachePath, FILE_IGNORE_NEW_LINES);
            $arr = [];
            foreach ($lines as $k => $v) {
                $tokens = explode(',', $v);
                $arr[$tokens[0]] = [$tokens[1], $tokens[2]];
            }
        } else {
            $rawPath = $config->rootDir.DIRECTORY_SEPARATOR.'payment'.DIRECTORY_SEPARATOR.$date.'.txt';
            if (file_exists($rawPath)) {
                $lines = file($rawPath, FILE_IGNORE_NEW_LINES);
                $arr = [];
                foreach ($lines as $k => $v) {
                    $tokens = explode('|', $v);
                    if (isset($arr[$tokens[1]]) == false) {
                        $arr[$tokens[1]] = [0, 0];
                    }
                    $arr[$tokens[1]][0] += $tokens[3];
                    $arr[$tokens[1]][1] += 1;
                }

                $file = fopen($cachePath, 'w');
                foreach ($arr as $k => $v) {
                    fwrite($file, $k.','.$v[0].','.$v[1].PHP_EOL);
                }
                fclose($file);
            } else {
                $arr = [];
            }
        }
        return $arr;
    }
    
    public static function fetchLogins($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $rawLoginPath = $config->rootDir.DIRECTORY_SEPARATOR.'login'.DIRECTORY_SEPARATOR.$date.'.txt';
        if (file_exists($rawLoginPath)) {
            $arr = file($rawLoginPath, FILE_IGNORE_NEW_LINES);
        } else {
            $arr = [];
        }
        return $arr;
    }
    
    public static function fetchLogouts($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $rawLoginPath = $config->rootDir.DIRECTORY_SEPARATOR.'logout'.DIRECTORY_SEPARATOR.$date.'.txt';
        if (file_exists($rawLoginPath)) {
            $arr = file($rawLoginPath, FILE_IGNORE_NEW_LINES);
        } else {
            $arr = [];
        }
        return $arr;
    }

    public static function fetchPropertyChange($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $fPath = $config->rootDir.DIRECTORY_SEPARATOR.'property_change'.DIRECTORY_SEPARATOR.$date.'.txt';
        if (file_exists($fPath)) {
            $arr = file($fPath, FILE_IGNORE_NEW_LINES);
        } else {
            $arr = [];
        }
        return $arr;
    }

    public static function fetchTotalChips() {
        $config = new Zend\Config\Config(include '../config.php');
        $fPath = $config->rootDir.DIRECTORY_SEPARATOR.'total_chips'.DIRECTORY_SEPARATOR.'total_chips.txt';
        if (file_exists($fPath)) {
            $arr = file($fPath, FILE_IGNORE_NEW_LINES);
        } else {
            $arr = [];
        }
        return $arr;
    }

    public static function fetchPokerResult($date) {
        $config = new Zend\Config\Config(include '../config.php');
        $rawLoginPath = $config->rootDir.DIRECTORY_SEPARATOR.'poker_result'.DIRECTORY_SEPARATOR.$date.'.txt';
        if (file_exists($rawLoginPath)) {
            $arr = file($rawLoginPath, FILE_IGNORE_NEW_LINES);
        } else {
            $arr = [];
        }
        return $arr;
    }

}
