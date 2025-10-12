<?php

// db.php = simple connection file use by the other php endpoints

header('Content-Type: application/json; charset=utf-8');

$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'simple_crud';

$conn = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if (!$conn) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'DB connect error: ' . mysqli_connect_errno()]);
  exit;
}
mysqli_set_charset($conn, 'utf8mb4')
?>
