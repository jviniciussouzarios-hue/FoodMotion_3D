-- ============================================================
-- FoodMotion 3D - Banco de Dados Oficial
-- Sufixo das tabelas e arquivo: _FoodMotion_3D
-- ============================================================

CREATE DATABASE IF NOT EXISTS `foodmotion_3d` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `foodmotion_3d`;

-- 1. Tabela de Restaurantes
CREATE TABLE IF NOT EXISTS `restaurants_FoodMotion_3D` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `logo_url` VARCHAR(255) NULL,
    `banner_url` VARCHAR(255) NULL,
    `address` VARCHAR(255) NOT NULL,
    `opening_hours` VARCHAR(100) NOT NULL,
    `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    `delivery_time_min` INT NOT NULL DEFAULT 35,
    `delivery_time_max` INT NOT NULL DEFAULT 50,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS `categories_FoodMotion_3D` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants_FoodMotion_3D`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS `products_FoodMotion_3D` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `product_type` ENUM('pizza', 'drink', 'side', 'dessert') NOT NULL DEFAULT 'pizza',
    `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `image_url` VARCHAR(255) NULL,
    `is_customizable_3d` TINYINT(1) NOT NULL DEFAULT 1,
    `max_flavors` INT NOT NULL DEFAULT 1,
    `slices` INT NOT NULL DEFAULT 8,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants_FoodMotion_3D`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories_FoodMotion_3D`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Sabores de Pizza
CREATE TABLE IF NOT EXISTS `pizza_flavors_FoodMotion_3D` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(60) NOT NULL DEFAULT 'Tradicional',
    `price_modifier` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `default_ingredients` JSON NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela de Ingredientes Modulares 3D
CREATE TABLE IF NOT EXISTS `ingredients_FoodMotion_3D` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('massa', 'borda', 'molho', 'queijo', 'recheio', 'finalizacao') NOT NULL,
    `layer` INT NOT NULL DEFAULT 5,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `color_hex` VARCHAR(20) NOT NULL DEFAULT '#ffffff',
    `is_removable` TINYINT(1) NOT NULL DEFAULT 1,
    `is_extra` TINYINT(1) NOT NULL DEFAULT 1,
    `model_type` VARCHAR(50) NOT NULL DEFAULT 'procedural_mesh',
    `active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS `orders_FoodMotion_3D` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(30) NOT NULL UNIQUE,
    `restaurant_id` INT NOT NULL,
    `customer_name` VARCHAR(120) NOT NULL,
    `customer_phone` VARCHAR(30) NOT NULL,
    `delivery_address` VARCHAR(255) NOT NULL,
    `status` ENUM('realizado', 'confirmado', 'preparacao', 'rota', 'finalizado') NOT NULL DEFAULT 'realizado',
    `subtotal` DECIMAL(10,2) NOT NULL,
    `delivery_fee` DECIMAL(10,2) NOT NULL,
    `total` DECIMAL(10,2) NOT NULL,
    `estimated_delivery` VARCHAR(50) NOT NULL,
    `items_json` LONGTEXT NOT NULL,
    `snapshot_3d` LONGTEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants_FoodMotion_3D`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
