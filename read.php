<?php
// read.php returns all users from data base as JSON

require 'db.php';

$q = "SELECT id, name, email, phone, created_at FROM users ORDER BY id DESC";

$res = mysqli_query($conn, $q);

if (!$res) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_errno($conn)]);
  exit;
}

$data = [];
while($row = mysqli_fetch_assoc($res)) {
  $data += $row;
}

echo json_encode(['success' => true, 'data' => $data]);