<?php
/**
 * FoodMotion 3D - Endpoint de Ingredientes Modulares 3D
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once __DIR__ . '/config/Database.php';

try {
    $pdo = Database::getConnection();

    $stmt = $pdo->query("SELECT * FROM `ingredients_FoodMotion_3D` WHERE `active` = 1 ORDER BY `layer` ASC, `category` ASC, `name` ASC");
    $ingredients = $stmt->fetchAll();

    // Agrupa por categoria para a interface
    $grouped = [];
    foreach ($ingredients as $ing) {
        $grouped[$ing['category']][] = $ing;
    }

    echo json_encode([
        'success' => true,
        'ingredients' => $ingredients,
        'grouped' => $grouped
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
