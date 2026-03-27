<?php
/**
 * Secure Media Deletion Endpoint
 * Deletes asset from Cloudinary and handles response for frontend
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration (Credentials provided by user)
$cloud_name = "dlkky5xuo";
$api_key = "113883731872149"; // Standard Cloudinary key format from their platform
$api_secret = "0OPoy3ZA3E2QYiQ9HSZNlRQjNnc";

// Get request data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->public_id)) {
    echo json_encode(["status" => "error", "message" => "Missing public_id"]);
    exit();
}

$public_id = $data->public_id;
$timestamp = time();

// Generate signature for Cloudinary (Required for secure deletion)
$params = [
    "public_id" => $public_id,
    "timestamp" => $timestamp
];
ksort($params);

$string_to_sign = "";
foreach ($params as $key => $value) {
    $string_to_sign .= "$key=$value&";
}
$string_to_sign = rtrim($string_to_sign, "&") . $api_secret;
$signature = sha1($string_to_sign);

// Cloudinary Destroy API URL
$url = "https://api.cloudinary.com/v1_1/$cloud_name/image/destroy";

$post_data = [
    "public_id" => $public_id,
    "timestamp" => $timestamp,
    "api_key" => $api_key,
    "signature" => $signature
];

// Execute cURL request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$response = json_decode($result);

if ($http_code === 200 && ($response->result === "ok" || $response->result === "not found")) {
    echo json_encode(["status" => "success", "result" => $response->result]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Cloudinary error", 
        "details" => $response,
        "debug_id" => $public_id
    ]);
}
?>
