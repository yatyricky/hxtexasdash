<?php
class DBHelper {
    public $conn;

    function __construct() {
        $config = new Zend\Config\Config(include 'config.php');
        $this->conn = mysqli_connect($config->dbhost, $config->dbuname, $config->dbpass, $config->dbname);
        if (!$this->conn) {
            $errorMsg = "Error: Unable to connect to MySQL.".PHP_EOL
                        ."Debugging errno: ".mysqli_connect_errno().PHP_EOL
                        ."Debugging error: ".mysqli_connect_error().PHP_EOL;
            throw new Exception($errorMsg);
        }
    }

    function __destruct() {
        mysqli_close($this->conn);
    }

    public function retrieveChannels($uid) {
        $query = "SELECT `channels` FROM `user` WHERE `id`=$uid";
        $result = mysqli_query($this->conn, $query);
        $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
        $ret = [];
        if (count($rows) == 1) {
            $ret = explode(",", $rows[0]['channels']);
        }
        return $ret;
    }
}