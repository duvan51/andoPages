<?php
require_once 'config.php';

// Simple direct password check for now
// In a real app, use password_hash and a users table
$admin_pass = "Promedid2026*"; 

$data = json_decode(file_get_contents('php://input'), true);
$password = $data['password'] ?? '';

if ($password === $admin_pass) {
    // Generate a simple session token (in production use real JWT or Sessions)
    $token = base64_encode("admin:" . time());
    echo json_encode(["status" => "success", "token" => $token]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Contraseña incorrecta"]);
}
?>
