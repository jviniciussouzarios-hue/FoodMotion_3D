<?php
/**
 * FoodMotion 3D - Endpoint de Informações do Restaurante e Cardápio
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

require_once __DIR__ . '/config/Database.php';

try {
    $pdo = Database::getConnection();

    // Busca restaurante padrão
    $stmt = $pdo->query("SELECT * FROM `restaurants_FoodMotion_3D` WHERE `active` = 1 LIMIT 1");
    $restaurant = $stmt->fetch();

    if (!$restaurant) {
        throw new Exception("Nenhum restaurante ativo encontrado.");
    }

    // Busca categorias
    $stmtCat = $pdo->prepare("SELECT * FROM `categories_FoodMotion_3D` WHERE `restaurant_id` = ? AND `active` = 1 ORDER BY `sort_order` ASC");
    $stmtCat->execute([$restaurant['id']]);
    $categories = $stmtCat->fetchAll();

    // Para cada categoria, busca produtos
    $stmtProd = $pdo->prepare("SELECT * FROM `products_FoodMotion_3D` WHERE `category_id` = ? AND `active` = 1 ORDER BY `id` ASC");
    foreach ($categories as &$cat) {
        $stmtProd->execute([$cat['id']]);
        $cat['products'] = $stmtProd->fetchAll();
    }

    // Sabores de Pizza disponíveis
    $stmtFlavors = $pdo->query("SELECT * FROM `pizza_flavors_FoodMotion_3D` WHERE `active` = 1 ORDER BY `category` ASC, `name` ASC");
    $flavors = $stmtFlavors->fetchAll();
    foreach ($flavors as &$fl) {
        $fl['default_ingredients'] = json_decode($fl['default_ingredients'], true);
    }

    echo json_encode([
        'success' => true,
        'restaurant' => $restaurant,
        'categories' => $categories,
        'pizza_flavors' => $flavors
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
