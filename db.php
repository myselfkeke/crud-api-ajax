<?php

// db.php = simple connection file use by the other php endpoints

header('Content-Type: application/json; charset=utf-8');

$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'simple_crud'

$con = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);


?>
