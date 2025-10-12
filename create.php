<?php
// create.php - create a user

require 'db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'POST required']);
  exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if ($name === '' || $email === '') {
  echo json_encode((['success', false, 'error' => 'Name and email are required']));
  exit;
}

$stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)");

mysqli_stmt_bind_param($stmt, 'sss', $name, $email, $phone);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['success' => true, 'id' => mysqli_insert_id($conn)]);

} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_errno($conn)]);
}