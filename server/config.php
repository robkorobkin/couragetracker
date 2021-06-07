<?php
/**
* PHP CRUD (Create Read Update Delete)
*
* PHP version 5.0
*
* @author     Isi Roca
* @category   PHP & Databases
* @copyright  Copyright (C) 2015 Isi Roca
* @link       http://isiroca.com
* @since      File available since Release 1.0.0
* @license    https://opensource.org/licenses/MIT  The MIT License (MIT)
* @see        https://github.com/IsiRoca/PHP-CRUD/issues
*
*/

    /*
     * Access DB data config
     */

$path = getcwd();


// PRODUCTION
if (strpos($path, "_rctracker") === false) {
	
	define('DB_HOST', 'localhost');
	define('DB_USER', 'rctracker');
	define('DB_PASS', '24School');
	define('DB_NAME', 'rctracker');
	define('DB_CHARSET', 'UTF-8');


	define("APP_URL", "http://143.198.166.174/");

}

// LOCAL
else {
	define('DB_HOST', 'localhost');
	define('DB_USER', 'root');
	define('DB_PASS', 'root');
	define('DB_NAME', 'rctracker');
	define('DB_CHARSET', 'UTF-8');


	define("APP_URL", "http://localhost/_rctracker");
}
    