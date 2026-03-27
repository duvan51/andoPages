<?php
require_once 'config.php';

/**
 * Endpoint to fetch all supplements and their matching treatments
 */

try {
    // Fetch supplements
    $query = "SELECT * FROM supplements ORDER BY title";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $supplements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch matching treatments for each supplement
    foreach ($supplements as &$supplement) {
        $supplement_id = $supplement['id'];
        $match_query = "SELECT treatment_id FROM supplement_matching WHERE supplement_id = :id";
        $match_stmt = $conn->prepare($match_query);
        $match_stmt->bindParam(':id', $supplement_id);
        $match_stmt->execute();
        
        $matches = $match_stmt->fetchAll(PDO::FETCH_COLUMN);
        $supplement['matchingTreatments'] = $matches;
    }
    
    echo json_encode([
        "status" => "success",
        "data" => $supplements
    ]);

} catch(PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>
