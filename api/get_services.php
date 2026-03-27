<?php
require_once 'config.php';

/**
 * Endpoint to fetch all treatments and their benefits
 */

try {
    // Fetch treatments
    $query = "SELECT * FROM treatments ORDER BY category, title";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $treatments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch benefits for each treatment
    foreach ($treatments as &$treatment) {
        $treatment_id = $treatment['id'];
        $benefit_query = "SELECT benefit FROM treatment_benefits WHERE treatment_id = :id";
        $benefit_stmt = $conn->prepare($benefit_query);
        $benefit_stmt->bindParam(':id', $treatment_id);
        $benefit_stmt->execute();
        
        $benefits = $benefit_stmt->fetchAll(PDO::FETCH_COLUMN);
        $treatment['benefits'] = $benefits;
    }
    
    echo json_encode([
        "status" => "success",
        "data" => $treatments
    ]);

} catch(PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
