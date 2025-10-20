<?php
// update.php to update/edit user details
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['success' => false, 'error' => 'POST required']);
  exit;
}
// Ensure folder exists for uploads
$uploadDir = __DIR__ . "/uploads/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$id = intval($_POST['id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if ($id <= 0 || $name === '' || $email === '') {
  echo json_encode(['success' => false, 'error' => 'Invalid input']);
  exit;
}

// ---- Handle File Upload ----
$resumePath = null;

if (!empty($_FILES['resume']['name'])) {
    $fileTmp  = $_FILES['resume']['tmp_name'];
    $fileName = basename($_FILES['resume']['name']);
    $fileExt  = pathinfo($fileName, PATHINFO_EXTENSION);

    // only allow specific formats
  $allowedExts = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
  if (!in_array($fileExt, $allowedExts)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type']);
    exit;
  }

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

if ($resumePath) {
  // If new file uploaded, update resume_path too
  $stmt = mysqli_prepare($conn, "UPDATE users SET name=?, email=?, phone=?, resume_path=? WHERE id=?");
  mysqli_stmt_bind_param($stmt, 'ssssi', $name, $email, $phone, $resumePath, $id);
} else {
  // Otherwise, just update text fields
  $stmt = mysqli_prepare($conn, "UPDATE users SET name=?, email=?, phone=? WHERE id=?");
  mysqli_stmt_bind_param($stmt, 'sssi', $name, $email, $phone, $id);
}

// $stmt = mysqli_prepare($conn, "UPDATE users SET name = ?, email = ?, phone = ?, resume_path = ? WHERE id = ?");

// mysqli_stmt_bind_param($stmt, 'ssssi', $name, $email, $phone, $resumePath, $id);

if (mysqli_stmt_execute($stmt)) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => mysqli_error($conn)]);
}