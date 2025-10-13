<?php
// update.php to update/edit user details
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'POST required']);
  exit;
}

$id = intval($_POST['id'] ?? 0);
$name = trim($_POST['name'] ?? '' );
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if ($id <= 0 || $name === '' || $email === '') {
  echo json_encode(['success' => false, 'error' => 'Invalid input']);
  exit;
}


$stmt = mysqli_prepare($conn, "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?");

mysqli_stmt_bind_param($stmt, 'sssi', $name, $email, $phone, $id);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
}