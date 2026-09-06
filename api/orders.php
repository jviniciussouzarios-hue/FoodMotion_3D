<?php
/**
 * FoodMotion 3D - Endpoint de Pedidos e Rastreamento em Tempo Real
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/config/Database.php';

try {
    $pdo = Database::getConnection();

    // GET: Buscar pedido por código ou listar
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!empty($_GET['code'])) {
            $stmt = $pdo->prepare("SELECT * FROM `orders_FoodMotion_3D` WHERE `order_code` = ? LIMIT 1");
            $stmt->execute([$_GET['code']]);
            $order = $stmt->fetch();

            if (!$order) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Pedido não encontrado.']);
                exit;
            }

            $order['items'] = json_decode($order['items_json'], true);
            $order['snapshot_3d'] = json_decode($order['snapshot_3d'], true);

            echo json_encode(['success' => true, 'order' => $order], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Listagem dos últimos pedidos
        $stmt = $pdo->query("SELECT id, order_code, customer_name, total, status, estimated_delivery, created_at FROM `orders_FoodMotion_3D` ORDER BY id DESC LIMIT 10");
        $orders = $stmt->fetchAll();
        echo json_encode(['success' => true, 'orders' => $orders], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // POST: Criar novo pedido ou avançar status
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);

        // Ação de avançar status para simular fluxo ao vivo
        if (isset($_GET['action']) && $_GET['action'] === 'advance_status') {
            $orderCode = $data['order_code'] ?? '';
            $statusFlow = ['realizado', 'confirmado', 'preparacao', 'rota', 'finalizado'];

            $stmt = $pdo->prepare("SELECT status FROM `orders_FoodMotion_3D` WHERE `order_code` = ?");
            $stmt->execute([$orderCode]);
            $current = $stmt->fetch();

            if (!$current) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Pedido não encontrado.']);
                exit;
            }

            $currIndex = array_search($current['status'], $statusFlow);
            $nextIndex = ($currIndex !== false && $currIndex < count($statusFlow) - 1) ? $currIndex + 1 : $currIndex;
            $newStatus = $statusFlow[$nextIndex];

            $updateStmt = $pdo->prepare("UPDATE `orders_FoodMotion_3D` SET `status` = ? WHERE `order_code` = ?");
            $updateStmt->execute([$newStatus, $orderCode]);

            echo json_encode([
                'success' => true, 
                'status' => $newStatus,
                'is_final' => ($newStatus === 'finalizado')
            ]);
            exit;
        }

        // Criação de Pedido
        $restaurantId = $data['restaurant_id'] ?? 1;
        $customerName = trim($data['customer_name'] ?? 'Cliente FoodMotion');
        $customerPhone = trim($data['customer_phone'] ?? '(13) 99784-1234');
        $deliveryAddress = trim($data['delivery_address'] ?? 'Avenida Presidente Kennedy, 6292 - Apto 42');
        $items = $data['items'] ?? [];
        $subtotal = floatval($data['subtotal'] ?? 0);
        $deliveryFee = floatval($data['delivery_fee'] ?? 3.99);
        $total = $subtotal + $deliveryFee;
        $snapshot3D = isset($data['snapshot_3d']) ? json_encode($data['snapshot_3d'], JSON_UNESCAPED_UNICODE) : null;

        if (empty($items)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'O carrinho está vazio.']);
            exit;
        }

        // Gera código de pedido (estilo referência #46596318)
        $orderCode = (string) rand(40000000, 49999999);

        // Calcula previsão estimada (ex: 40 a 50 min a partir de agora)
        $now = new DateTime();
        $min = (clone $now)->modify('+35 minutes')->format('H:i');
        $max = (clone $now)->modify('+50 minutes')->format('H:i');
        $estimatedDelivery = "{$min} - {$max}";

        $stmt = $pdo->prepare("
            INSERT INTO `orders_FoodMotion_3D` 
            (`order_code`, `restaurant_id`, `customer_name`, `customer_phone`, `delivery_address`, `status`, `subtotal`, `delivery_fee`, `total`, `estimated_delivery`, `items_json`, `snapshot_3d`) 
            VALUES 
            (?, ?, ?, ?, ?, 'realizado', ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $orderCode,
            $restaurantId,
            $customerName,
            $customerPhone,
            $deliveryAddress,
            $subtotal,
            $deliveryFee,
            $total,
            $estimatedDelivery,
            json_encode($items, JSON_UNESCAPED_UNICODE),
            $snapshot3D
        ]);

        echo json_encode([
            'success' => true,
            'order_code' => $orderCode,
            'status' => 'realizado',
            'estimated_delivery' => $estimatedDelivery,
            'total' => $total,
            'message' => 'Pedido realizado com sucesso!'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
