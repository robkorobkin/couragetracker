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
	const DB_HOST = 'localhost'; // Your Database Host
    const DB_USER = 'root'; // Your Database User Name
    const DB_PASS = ''; // Your Database Password
    const DB_NAME = 'rctracker'; // Your Database Name
    const DB_CHARSET = 'UTF-8'; // Your Database Charset
}

// LOCAL
else {
	const DB_HOST = 'localhost'; // Your Database Host
    const DB_USER = 'root'; // Your Database User Name
    const DB_PASS = 'root'; // Your Database Password
    const DB_NAME = 'rctracker'; // Your Database Name
    const DB_CHARSET = 'UTF-8'; // Your Database Charset
}
    