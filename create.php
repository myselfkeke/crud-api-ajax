<?php
header("Content-Type: application/json");
// create.php - create a user

require 'db.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'POST required']);
  exit;
}
// Ensure folder exists for uploads
$uploadDir = __DIR__ . "/uploads/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if ($name === '' || $email === '') {
  echo json_encode((['success' => false, 'error' => 'Name and email are required']));
  exit;
}
// ---- Handle File Upload ----
$resumePath = null;

if (!empty($_FILES['resume']['name'])) {
    $fileTmp  = $_FILES['resume']['tmp_name'];
    $fileName = basename($_FILES['resume']['name']);
    $fileExt  = pathinfo($fileName, PATHINFO_EXTENSION);

    // Create a unique filename (timestamp + random string)
    $newFileName = uniqid("resume_", true) . "." . strtolower($fileExt);
    $targetFile = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmp, $targetFile)) {
        $resumePath = "uploads/" . $newFileName;
    } else {
        echo json_encode(["success" => false, "error" => "File upload failed"]);
        exit;
    }
}
error_log("Resume path: " . $resumePath);

$stmt = mysqli_prepare($conn, "INSERT INTO users (name, email, phone, resume_path) VALUES (?, ?, ?, ?)");

mysqli_stmt_bind_param($stmt, 'ssss', $name, $email, $phone, $resumePath);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['success' => true, 'id' => mysqli_insert_id($conn)]);

} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_errno($conn)]);
}