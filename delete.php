<?php
// delete.php - delete a user
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'POST required']);
  exit;
}

$id = intval($_POST['id'] ?? 0);
  if ($id<=0) {
    echo json_encode(['success' => false, 'error' => 'Invalid id']);
    exit;
  }

$stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id = ?");
mysqli_stmt_bind_param($stmt, 'i', $id);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
}