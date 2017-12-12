<?php
require_once('vendor/autoload.php');
require_once('conn.php');
use \Firebase\JWT\JWT;
use Zend\Http\PhpEnvironment\Request;

function authenticate($name = "", $code = "") {

    $resp = [];

    $config = new Zend\Config\Config(include 'config.php');

    /*
     * Get authorization header from the HTTP request
     */
    $request = new Request();
    $authHeader = $request->getHeader('Authorization');

    /*
     * Look for the 'authorization' header
     * For in-app requests
     */
    if ($authHeader) {
        /*
         * Extract the jwt from the Bearer
         */
        list($jwt) = sscanf($authHeader->toString(), 'Authorization: Bearer %s');

        if ($jwt) {
            try {
                $secretKey = base64_decode($config->jwtKey);
                $decoded = JWT::decode($jwt, $secretKey, array('HS256'));

                // Authorized, JWT is valid
                // But needs to verify page accessbility

                // check permission for certain page
                if ($_POST['view']) {
                    $view = $_POST['view'];
                    if (substr($view, 0, 1) != "/") {
                        $view = "/".$view;
                    }
                    $ugroup = $decoded->ugroup;
                    $pagesAllowed = $config->PERMISSIONS->$ugroup->toArray();
                    $fpagesAllowed = array_flip($pagesAllowed);
                    if (isset($fpagesAllowed[$view])) {
                        // user has access to this page
                        $resp['result'] = 'auth';
                        $resp['view'] = $view;
                        $resp['header'] = 'HTTP/1.0 200 OK';
                        $resp['ugroup'] = $ugroup;
                    } else {
                        // deny requested page
                        $resp['result'] = 'Rejected: no access to requested page';
                        $resp['header'] = 'HTTP/1.0 403 Forbidden';
                    }
                } else {
                    $resp['result'] = 'Rejected: no page request';
                    $resp['header'] = 'HTTP/1.0 400 Bad Request';
                }
            } catch (Exception $e) {
                /*
                 * the token was not able to be decoded.
                 * this is likely because the signature was not able to be verified (tampered token)
                 */
                $resp['result'] = 'Reject: invalid token';
                $resp['header'] = 'HTTP/1.0 401 Unauthorized';
            }
        } else {
            /*
             * No token was able to be extracted from the authorization header
             */
            $resp['result'] = 'reject';
            $resp['header'] = 'HTTP/1.0 400 Bad Request';
        }
    } else {
        /*
         * For login
         */
        $dbhelper = new DBHelper();
        $link = $dbhelper->conn;
        $query = "SELECT * FROM `user` WHERE `username`='".addslashes($name)."'";
        $result = mysqli_query($link, $query);
        if ($result) {
            $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
            if (count($rows) > 0) {
                if (password_verify($code, $rows[0]['encpass'])) {
                    $issuedAt   = time();
                    $notBefore  = $issuedAt;             //Adding 10 seconds
                    $expire     = $notBefore + $config->expr;   // Adding 4 hours
                    $serverName = $config->serverName; // Retrieve the server name from config file

                    $token = array(
                        "iss" => $serverName,
                        "aud" => "http://something.else",
                        "iat" => $issuedAt,
                        "nbf" => $notBefore,
                        'exp' => $expire,            // Expire
                        'ugroup' => $rows[0]['usergroup']
                    );
                    $secretKey = base64_decode($config->jwtKey);

                    $jwt = JWT::encode($token, $secretKey);

                    $resp['header'] = 'HTTP/1.0 200 OK';
                    $resp['result'] = 'success';
                    $resp['ugroup'] = $rows[0]['usergroup'];
                    $resp['jwt'] = $jwt;
                } else {
                    $resp['result'] = 'Wrong password';
                    $resp['header'] = 'HTTP/1.0 401 Unauthorized';
                }
            } else {
                $resp['result'] = 'No such user';
                $resp['header'] = 'HTTP/1.0 401 Unauthorized';
            }
        } else {
            $resp['result'] = 'Bad query';
            $resp['header'] = 'HTTP/1.0 400 Bad Request';
        }
        unset($dbhelper);
    }

    return $resp;
}
