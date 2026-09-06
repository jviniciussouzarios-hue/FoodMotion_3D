<?php
/**
 * Auto-Instalação e Auto-Migração do Banco de Dados FoodMotion 3D
 * Cria o banco e as tabelas automaticamente sem necessidade de comandos manuais.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config/Database.php';

try {
    // 1. Conecta no servidor MySQL sem selecionar o banco
    $pdo = Database::getRawConnectionWithoutDb();

    // 2. Cria a base se não existir
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `foodmotion_3d` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `foodmotion_3d`;");

    // 3. Lê o arquivo SQL oficial
    $sqlFile = __DIR__ . '/../database_FoodMotion_3D.sql';
    if (file_exists($sqlFile)) {
        $sqlContent = file_get_contents($sqlFile);
        $pdo->exec($sqlContent);
    }

    // 4. Popula Restaurante Padrão (Baseado na referência do usuário Tocco Delivery / FoodMotion)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `restaurants_FoodMotion_3D`");
    if ($stmt->fetch()['count'] == 0) {
        $pdo->exec("
            INSERT INTO `restaurants_FoodMotion_3D` 
            (`id`, `name`, `slug`, `logo_url`, `banner_url`, `address`, `opening_hours`, `delivery_fee`, `delivery_time_min`, `delivery_time_max`, `active`) 
            VALUES 
            (1, 'Tocco Pizza Gourmet 3D', 'tocco-gourmet', 'assets/img/logo-tocco.png', 'assets/img/banner-pizza.jpg', 'Avenida Presidente Kennedy, 6292', 'Aberto até as 23:50', 3.99, 40, 50, 1);
        ");
    }

    // 5. Categorias
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `categories_FoodMotion_3D`");
    if ($stmt->fetch()['count'] == 0) {
        $pdo->exec("
            INSERT INTO `categories_FoodMotion_3D` (`id`, `restaurant_id`, `name`, `slug`, `sort_order`, `active`) VALUES
            (1, 1, 'Pizzas Salgadas (Mais de 50 Sabores)', 'pizzas-salgadas', 1, 1),
            (2, 1, 'Bebidas Geladas', 'bebidas', 2, 1),
            (3, 1, 'Acompanhamentos Especiais', 'acompanhamentos', 3, 1),
            (4, 1, 'Sobremesas', 'sobremesas', 4, 1);
        ");
    }

    // 6. Produtos
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `products_FoodMotion_3D`");
    if ($stmt->fetch()['count'] == 0) {
        $pdo->exec("
            INSERT INTO `products_FoodMotion_3D` 
            (`id`, `restaurant_id`, `category_id`, `name`, `description`, `product_type`, `base_price`, `image_url`, `is_customizable_3d`, `max_flavors`, `slices`, `active`) VALUES
            (1, 1, 1, 'PIZZA SALGADA GRANDE - 8 PEDAÇOS', 'Monte em 3D em tempo real. Escolha até 2 sabores, borda recheada e ajuste cada ingrediente.', 'pizza', 69.90, 'assets/img/pizza-grande.jpg', 1, 2, 8, 1),
            (2, 1, 1, 'PIZZA SALGADA BROTO - 4 PEDAÇOS', 'Perfeita para 1 a 2 pessoas. Massa artesanal e até 2 sabores montados em 3D.', 'pizza', 38.00, 'assets/img/pizza-broto.jpg', 1, 2, 4, 1),
            (3, 1, 1, 'PIZZA SALGADA FAMÍLIA - 12 PEDAÇOS', 'Tamanho gigante para toda a galera. Até 3 sabores simultâneos com renderização 3D.', 'pizza', 89.90, 'assets/img/pizza-familia.jpg', 1, 3, 12, 1),
            (4, 1, 2, 'Coca-Cola Original 350ml Lata', 'Refrigerante gelado lata 350ml', 'drink', 6.50, 'assets/img/coca-lata.jpg', 0, 1, 1, 1),
            (5, 1, 2, 'Guaraná Antarctica 350ml Lata', 'O original do Brasil, servido bem gelado', 'drink', 6.00, 'assets/img/guarana-lata.jpg', 0, 1, 1, 1),
            (6, 1, 2, 'Cerveja Heineken Long Neck 330ml', 'Puro malte refrescante e bem gelada', 'drink', 10.90, 'assets/img/heineken.jpg', 0, 1, 1, 1),
            (7, 1, 3, 'Batata Frita Rústica Especial', 'Batatas crocantes com alecrim fresco e páprica defumada', 'side', 28.90, 'assets/img/batata-frita.jpg', 0, 1, 1, 1);
        ");
    }

    // 7. Sabores de Pizza
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `pizza_flavors_FoodMotion_3D`");
    if ($stmt->fetch()['count'] == 0) {
        $flavors = [
            [
                'Calabresa Especial', 
                'Molho artesanal, muçarela, fatias de calabresa defumada, cebola fatiada e azeitonas pretas.', 
                'Tradicional', 
                0.00, 
                json_encode(['calabresa', 'cebola', 'azeitona', 'oregano'])
            ],
            [
                'Portuguesa Completa', 
                'Presunto cozido fatiado, ovos cozidos, rodelas de cebola, azeitonas e orégano.', 
                'Especial', 
                5.00, 
                json_encode(['presunto', 'ovo', 'cebola', 'azeitona', 'oregano'])
            ],
            [
                'Frango com Catupiry Original', 
                'Peito de frango desfiado temperado com ervas e generosa camada de Catupiry cremoso.', 
                'Especial', 
                6.00, 
                json_encode(['frango', 'catupiry', 'milho', 'oregano'])
            ],
            [
                'Carne Seca com Catupiry', 
                'Carne seca desfiada bem temperada, Catupiry original e toque de cebola.', 
                'Premium', 
                8.00, 
                json_encode(['carne_seca', 'catupiry', 'cebola', 'oregano'])
            ],
            [
                'Margherita do Chef', 
                'Molho fresco de tomates, queijo muçarela derretido, rodelas de tomate e manjericão fresco.', 
                'Tradicional', 
                0.00, 
                json_encode(['tomate', 'manjericao', 'azeitona', 'oregano'])
            ],
            [
                'Quatro Queijos Nobres', 
                'Muçarela, provolone aromático, queijo gorgonzola e Catupiry cremoso.', 
                'Especial', 
                7.00, 
                json_encode(['parmesao', 'gorgonzola', 'catupiry', 'oregano'])
            ],
            [
                'Champignon ao Bacon', 
                'Fatias selecionadas de champignon salteado com cubinhos crocantes de bacon defumado.', 
                'Premium', 
                9.00, 
                json_encode(['champignon', 'bacon', 'cebola', 'oregano'])
            ]
        ];

        $stmtFlavor = $pdo->prepare("INSERT INTO `pizza_flavors_FoodMotion_3D` (`name`, `description`, `category`, `price_modifier`, `default_ingredients`, `active`) VALUES (?, ?, ?, ?, ?, 1)");
        foreach ($flavors as $f) {
            $stmtFlavor->execute($f);
        }
    }

    // 8. Ingredientes Modulares 3D
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM `ingredients_FoodMotion_3D`");
    if ($stmt->fetch()['count'] == 0) {
        $ingredients = [
            // Bordas
            ['borda_tradicional', 'Borda Tradicional Crocante', 'borda', 2, 0.00, '#d97706', 0, 0, 'border_plain'],
            ['borda_catupiry', 'Borda Recheada de Catupiry', 'borda', 2, 10.00, '#fef08a', 1, 1, 'border_catupiry'],
            ['borda_cheddar', 'Borda Recheada de Cheddar Cremoso', 'borda', 2, 10.00, '#f59e0b', 1, 1, 'border_cheddar'],
            ['borda_chocolate', 'Borda Vulcão de Chocolate Nobre', 'borda', 2, 12.00, '#451a03', 1, 1, 'border_chocolate'],

            // Camadas Base
            ['massa_tradicional', 'Massa Tradicional de Fermentação Lenta', 'massa', 1, 0.00, '#f59e0b', 0, 0, 'dough'],
            ['molho_tomate', 'Molho de Tomate Rústico com Ervas', 'molho', 3, 0.00, '#dc2626', 1, 0, 'sauce'],
            ['queijo_mussarela', 'Muçarela Especial Derretida', 'queijo', 4, 0.00, '#fef08a', 1, 1, 'cheese'],

            // Recheios 3D
            ['calabresa', 'Fatias de Calabresa Defumada', 'recheio', 5, 4.00, '#991b1b', 1, 1, 'calabresa_slice'],
            ['cebola', 'Rodelas Finas de Cebola', 'recheio', 5, 2.50, '#f3e8ff', 1, 1, 'onion_ring'],
            ['presunto', 'Presunto Cozido em Tiras', 'recheio', 5, 4.50, '#f43f5e', 1, 1, 'ham_strip'],
            ['azeitona', 'Azeitonas Pretas sem Caroço', 'recheio', 5, 3.00, '#1c1917', 1, 1, 'olive_black'],
            ['manjericao', 'Folhas Frescas de Manjericão', 'recheio', 6, 2.00, '#15803d', 1, 1, 'basil_leaf'],
            ['tomate', 'Rodelas de Tomate Fresco', 'recheio', 5, 3.00, '#ef4444', 1, 1, 'tomato_slice'],
            ['champignon', 'Fatias de Champignon Nobre', 'recheio', 5, 5.50, '#e7e5e4', 1, 1, 'mushroom_slice'],
            ['bacon', 'Cubos de Bacon Crocante', 'recheio', 5, 5.00, '#78350f', 1, 1, 'bacon_cube'],
            ['frango', 'Frango Desfiado Temperado', 'recheio', 5, 5.00, '#d97706', 1, 1, 'chicken_shred'],
            ['catupiry', 'Catupiry Original Bisnaga', 'recheio', 5, 6.00, '#fef9c3', 1, 1, 'catupiry_swirl'],
            ['milho', 'Milho Doce Selecionado', 'recheio', 5, 2.50, '#facc15', 1, 1, 'corn_kernel'],
            ['carne_seca', 'Carne Seca Desfiada Artesanal', 'recheio', 5, 7.50, '#7c2d12', 1, 1, 'carne_seca_shred'],
            ['oregano', 'Orégano Chileno Polvilhado', 'finalizacao', 6, 0.00, '#166534', 1, 0, 'oregano_dust']
        ];

        $stmtIng = $pdo->prepare("INSERT INTO `ingredients_FoodMotion_3D` (`id`, `name`, `category`, `layer`, `price`, `color_hex`, `is_removable`, `is_extra`, `model_type`, `active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        foreach ($ingredients as $ing) {
            $stmtIng->execute($ing);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Banco de dados foodmotion_3d e todas as tabelas _FoodMotion_3D foram configuradas e populadas com sucesso!'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
