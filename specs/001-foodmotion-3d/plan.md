# Architecture & Technical Plan: FoodMotion 3D

**Feature Directory**: `specs/001-foodmotion-3d`
**Status**: In Implementation

## 1. Stack Tecnológica
- **Frontend**: Vanilla HTML5, CSS3 moderno (Dark theme OLED/Gastronômico, Glassmorphism, Google Fonts Outfit & Inter), JavaScript ES6 Modular.
- **Renderização 3D**: Three.js (r128) com OrbitControls, sombras suaves (PCFSoftShadowMap), renderizador PBR (MeshStandardMaterial e MeshPhysicalMaterial), sistema de iluminação de 3 pontos com luz quente de destaque (Key, Fill, Warm Rim).
- **Backend**: PHP 8.2 (REST API modular) com PDO seguro e tratamento de exceções.
- **Banco de Dados**: MySQL 10.4 MariaDB (XAMPP local), database `foodmotion_3d`.
- **Auto-Instalação**: Script PHP inteligente que verifica existência do banco e tabelas no primeiro acesso, criando e populando sem intervenção manual.

## 2. Componentes e Estrutura de Código
- `database_FoodMotion_3D.sql`: Esquema SQL oficial com sufixo do projeto.
- `api/config/Database.php`: Singleton de conexão PDO com credenciais locais.
- `api/setup_database_FoodMotion_3D.php`: Auto-migrador e populador de dados padrão (Restaurante "Tocco Gourmet 3D", Pizzas, Bebidas, Ingredientes).
- `api/products.php`, `api/ingredients.php`, `api/orders.php`: Endpoints REST JSON.
- `assets/js/engine/FoodProductEngine.js`: Motor central Three.js para o customizador.
- `assets/js/engine/PizzaBuilder.js`: Construção da massa, borda, molho e queijo 3D.
- `assets/js/engine/IngredientManager.js`: Gestão de toppings (Calabresa, Presunto, Manjericão, Champignon, Cebola, Azeitonas, Tomate, etc.) com animações de queda e subida.
- `assets/js/engine/CartScene3D.js`: Motor 3D do carrinho exibindo a pizza montada e o refrigerante 3D lado a lado em uma tábua de madeira gastronômica.
- `assets/js/app.js`: Orquestrador da interface (navegação entre cardápio, montador 3D, carrinho 3D e rastreamento de pedido).
