<?php
require_once 'config.php';

/**
 * Endpoint to Create or Update a treatment
 */

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit;
}

// Basic Token Check (Implement proper security headers later)
// For now we trust the client if they have the ID
$id = $data['id'];
$title = $data['title'];
$subtitle = $data['subtitle'] ?? '';
$description = $data['description'] ?? '';
$category = $data['category'];
$subcategory = $data['subcategory'] ?? '';
$tag = $data['tag'] ?? '';
$imageUrl = $data['imageUrl'] ?? '';
$price = $data['price'] ?? '';
$packagePrice = $data['packagePrice'] ?? '';
$discount = $data['discount'] ?? null;
$notes = $data['notes'] ?? '';

try {
    // Check if exists
    $check = $conn->prepare("SELECT id FROM treatments WHERE id = ?");
    $check->execute([$id]);
    
    if ($check->fetch()) {
        // Update
        $sql = "UPDATE treatments SET 
                title=?, subtitle=?, description=?, category=?, subcategory=?, 
                tag=?, imageUrl=?, price=?, packagePrice=?, discount=?, notes=? 
                WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $title, $subtitle, $description, $category, $subcategory, 
            $tag, $imageUrl, $price, $packagePrice, $discount, $notes, $id
        ]);
        $message = "Servicio actualizado correctamente";
    } else {
        // Insert
        $sql = "INSERT INTO treatments (
                id, title, subtitle, description, category, subcategory, 
                tag, imageUrl, price, packagePrice, discount, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $id, $title, $subtitle, $description, $category, $subcategory, 
            $tag, $imageUrl, $price, $packagePrice, $discount, $notes
        ]);
        $message = "Servicio creado correctamente";
    }

    // Handle benefits (Simple approach: delete all and re-insert)
    if (isset($data['benefits']) && is_array($data['benefits'])) {
        $conn->prepare("DELETE FROM treatment_benefits WHERE treatment_id = ?")->execute([$id]);
        $benefitStmt = $conn->prepare("INSERT INTO treatment_benefits (treatment_id, benefit) VALUES (?, ?)");
        foreach ($data['benefits'] as $benefit) {
            if (!empty($benefit)) {
                $benefitStmt->execute([$id, $benefit]);
            }
        }
    }

    echo json_encode(["status" => "success", "message" => $message]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
