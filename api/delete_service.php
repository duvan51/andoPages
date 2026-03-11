<?php
require_once 'config.php';

/**
 * Endpoint to Delete a treatment
 */

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(["status" => "error", "message" => "No ID provided"]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM treatments WHERE id = ?");
    $stmt->execute([$data['id']]);
    
    echo json_encode(["status" => "success", "message" => "Servicio eliminado"]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
