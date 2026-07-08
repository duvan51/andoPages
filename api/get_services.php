<?php
/**
 * Dynamic Catalog API Proxy for andoPages (Supabase integration)
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$supabaseUrl = "https://vcjyvquqgteqiemdnrul.supabase.co";
$supabaseKey = "sb_publishable_l5VJBPLTlzstB9sMHaoJqw_vV07pibv";

$company_id = $_GET['companyId'] ?? $_GET['company_id'] ?? null;

if (!$company_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Parámetro companyId requerido."
    ]);
    exit();
}

try {
    // Query treatments associated with the given company_id from Supabase
    $url = $supabaseUrl . "/rest/v1/treatments?company_id=eq." . urlencode($company_id) . "&select=*";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: " . $supabaseKey,
        "Authorization: Bearer " . $supabaseKey,
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $data = json_decode($response, true);
        echo json_encode([
            "status" => "success",
            "data" => $data
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener datos del servidor de base de datos.",
            "code" => $httpCode
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Server exception: " . $e->getMessage()
    ]);
}
?>
