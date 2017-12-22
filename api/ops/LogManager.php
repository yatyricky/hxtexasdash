<?php
class LogManager {

    public static function mapChannelConfig($channels) {
        $config = new Zend\Config\Config(include '../config.php');
        $chnconf = $config->CHANNELS->toArray();
        $ret = array_flip($channels);
        foreach ($ret as $k => &$v) {
            $v = $chnconf[$k];
        }
        return $ret;
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

    public static function fetchLogWithinPeriodFiltered($dateStart, $dateEnd, $channels, $whichLog, $keyIndexes) {
        $config = new Zend\Config\Config(include '../config.php');

        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $channelsFlip = array_flip($channels);
        $ret = [];
        while ($end >= $start) {
            $dayStr = $start->format('Y-m-d');

            $rawPath = $config->rootDir.DIRECTORY_SEPARATOR.$whichLog.DIRECTORY_SEPARATOR.$dayStr.'.txt';
            if (file_exists($rawPath)) {
                $lines = file($rawPath, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $k => $v) {
                    $t = explode('|', trim($v));
                    // channel must match
                    if (isset($channelsFlip[$t[$keyIndexes['channel']]])) {
                        $obj = [];
                        foreach ($keyIndexes as $kk => $vv) {
                            if ($kk == "deviceId") {
                                $obj = array_merge($obj, [$kk => md5($t[$vv])]);
                            } else {
                                $obj = array_merge($obj, [$kk => $t[$vv]]);
                            }
                        }
                        $ret[] = $obj;
                    }
                }
            }
            $start->modify('+1 day');
        }
        return $ret;
    }

    /**
     * $t is short for $tokens
     *  0. timestamp(UTC+8)
     *  1. player_id
     *  2. player_name
     *  3. game_version
     *  4. channel_name
     *  5. device_id(IMEI, UDID)
     *  6. os_version(6.0, 10.1.1)
     *  7. network_type(Wi-Fi, 4G)
     *  8. ip_address
     *  9. is_new_device
     * 
     * NOT ID UNIQUE, NOT DEVICE UNIQUE
     * return: array
     *  [
     *      {
     *          userId: 1000001,
     *          version: 'v0.0.1.0001'
     *          channel: 'dev_test_1',
     *          deviceId: '423412341',
     *          newDevice: 1
     *      },
     *      ...
     *  ]
     *  ** NO FILE CACHE **
     * 
     */
    public static function fetchActiveUserInPeriodFiltered($dateStart, $dateEnd, $channels) {
        $config = new Zend\Config\Config(include '../config.php');

        $ret = [];
        $start = new DateTime($dateStart);
        $end = new DateTime($dateEnd);
        $channelsFlip = array_flip($channels);
        while ($end >= $start) {
            $dayStr = $start->format('Y-m-d');
            
            $uniqueDevices = [];
            $rawPath = $config->rootDir.DIRECTORY_SEPARATOR.'login'.DIRECTORY_SEPARATOR.$dayStr.'.txt';
            if (file_exists($rawPath)) {
                $lines = file($rawPath, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $k => $v) {
                    $t = explode('|', trim($v));
                    // channel must match
                    if (!isset($uniqueDevices[$t[5]]) && isset($channelsFlip[$t[4]])) {
                        $uniqueDevices[$t[5]] = 1;
                        $obj = array(
                            'timeStamp' => $t[0],
                            'version' => $t[3],
                            'channel' => $t[4],
                            'deviceId' => md5($t[5])
                        );
                        $ret[] = $obj;
                    }
                }
            }

            $rawPath = $config->rootDir.DIRECTORY_SEPARATOR.'logout'.DIRECTORY_SEPARATOR.$dayStr.'.txt';
            if (file_exists($rawPath)) {
                $lines = file($rawPath, FILE_IGNORE_NEW_LINES);
                foreach ($lines as $k => $v) {
                    $t = explode('|', trim($v));
                    // channel must match
                    if (!isset($uniqueDevices[$t[5]]) && isset($channelsFlip[$t[4]])) {
                        $uniqueDevices[$t[5]] = 1;
                        $obj = array(
                            'timeStamp' => $t[0],
                            'version' => $t[3],
                            'channel' => $t[4],
                            'deviceId' => md5($t[5])
                        );
                        $ret[] = $obj;
                    }
                }
            }
            $start->modify('+1 day');
        }
        return $ret;
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
