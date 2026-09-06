<?php
/**
 * FoodMotion 3D - Plataforma Interativa de Customização Gastronômica
 * Ponto de Entrada Principal
 */

// Auto-verificação do banco de dados na primeira inicialização
require_once __DIR__ . '/api/config/Database.php';
try {
    $pdo = Database::getConnection();
    $check = $pdo->query("SHOW TABLES LIKE 'restaurants_FoodMotion_3D'");
    if ($check->rowCount() == 0) {
        require_once __DIR__ . '/api/setup_database_FoodMotion_3D.php';
    }
} catch (Exception $e) {
    // Se o banco ainda não existe, roda o instalador silenciosamente
    require_once __DIR__ . '/api/setup_database_FoodMotion_3D.php';
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>FoodMotion 3D • Cardápio & Montagem Interativa</title>
    <meta name="description" content="Personalize sua comida em 3D em tempo real com ingredientes modulares, animações fluidas e carrinho visual 3D.">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- ============================================================
         1. CABEÇALHO DO RESTAURANTE (Inspirado na Referência Tocco Delivery)
         ============================================================ -->
    <header class="restaurant-hero">
        <div class="hero-overlay"></div>
        <div class="hero-content">
            <div class="restaurant-avatar">🍕</div>
            <div class="restaurant-info">
                <div class="restaurant-title">
                    <span id="restaurant-name">Tocco Pizza Gourmet 3D</span>
                    <span class="badge-3d">3D MOTION</span>
                </div>
                <div class="restaurant-address">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span id="restaurant-address">Avenida Presidente Kennedy, 6292</span>
                </div>
                <div class="restaurant-meta">
                    <span class="meta-chip open">
                        <span style="width:7px; height:7px; background:#10b981; border-radius:50%; display:inline-block;"></span>
                        <span id="restaurant-hours">Aberto até as 23:50</span>
                    </span>
                    <span class="meta-chip">🛵 Entrega e Retirada</span>
                    <span class="meta-chip" id="delivery-fee-badge">Taxa: R$ 3,99</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Barra de Cálculo de Entrega e Busca -->
    <div style="max-width:1200px; margin: 16px auto 0; padding: 0 20px;">
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-full); padding: 10px 18px; display:flex; align-items:center; gap:12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Buscar no cardápio de pizzas e bebidas..." style="background:transparent; border:none; color:var(--text-main); font-size:14px; outline:none; width:100%;">
        </div>
    </div>

    <!-- ============================================================
         2. ABAS DE CATEGORIAS (Scroll Horizontal Fixo)
         ============================================================ -->
    <div class="category-bar-wrapper">
        <div class="category-bar" id="category-tabs-container">
            <!-- Gerado dinamicamente via app.js -->
        </div>
    </div>

    <!-- ============================================================
         3. CATÁLOGO DE PRODUTOS
         ============================================================ -->
    <main class="catalog-container" id="catalog-content">
        <!-- Renderizado dinamicamente via app.js -->
    </main>

    <!-- ============================================================
         4. MODAL DO CUSTOMIZADOR 3D DA PIZZA
         ============================================================ -->
    <div class="customizer-modal" id="customizer-modal">
        <div class="customizer-container">
            <!-- Viewport 3D -->
            <div class="customizer-viewport-area">
                <div class="viewport-header">
                    <button class="btn-icon-round" id="btn-close-customizer" title="Voltar ao cardápio">✕</button>
                    <div style="background:rgba(18,22,31,0.85); backdrop-filter:blur(8px); padding:6px 14px; border-radius:var(--radius-full); border:1px solid var(--border-subtle); font-size:12px; font-weight:700; color:var(--accent-gold);">
                        🍕 MOTOR 3D • FOODMOTION
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon-round" id="btn-undo-3d" title="Desfazer">↺</button>
                        <button class="btn-icon-round" id="btn-redo-3d" title="Refazer">↻</button>
                    </div>
                </div>

                <!-- Canvas Three.js -->
                <div class="canvas-3d-box" id="customizer-canvas-box"></div>

                <!-- Controles de Câmera -->
                <div class="viewport-floating-controls">
                    <button class="cam-btn active" id="cam-preset-3d">Perspectiva</button>
                    <button class="cam-btn" id="cam-preset-top">Aérea</button>
                    <button class="cam-btn" id="cam-preset-side">Lateral</button>
                    <button class="cam-btn" id="cam-toggle-rotate">Girar 360°</button>
                </div>
            </div>

            <!-- Painel de Personalização -->
            <div class="customizer-panel-area">
                <div class="panel-scroll-content">
                    
                    <!-- Passo 1: Tamanho -->
                    <div class="wizard-step-title">
                        <span class="step-number">1</span> Tamanho da Pizza
                    </div>
                    <div class="options-pill-grid">
                        <div class="option-card-pill size-pill" data-slices="4" data-price="38.00">
                            <div class="option-title">Broto</div>
                            <div class="option-desc">4 pedaços</div>
                            <div class="option-price">R$ 38,00</div>
                        </div>
                        <div class="option-card-pill size-pill selected" data-slices="8" data-price="69.90">
                            <div class="option-title">Grande</div>
                            <div class="option-desc">8 pedaços</div>
                            <div class="option-price">R$ 69,90</div>
                        </div>
                        <div class="option-card-pill size-pill" data-slices="12" data-price="89.90">
                            <div class="option-title">Família</div>
                            <div class="option-desc">12 pedaços</div>
                            <div class="option-price">R$ 89,90</div>
                        </div>
                    </div>

                    <!-- Passo 2: Borda Recheada -->
                    <div class="wizard-step-title">
                        <span class="step-number">2</span> Borda Recheada
                    </div>
                    <div class="options-pill-grid">
                        <div class="option-card-pill border-pill selected" data-border="borda_tradicional" data-price="0.00">
                            <div class="option-title">Tradicional</div>
                            <div class="option-desc">Crocante</div>
                            <div class="option-price">Inclusa</div>
                        </div>
                        <div class="option-card-pill border-pill" data-border="borda_catupiry" data-price="10.00">
                            <div class="option-title">Catupiry</div>
                            <div class="option-desc">Original</div>
                            <div class="option-price">+R$ 10,00</div>
                        </div>
                        <div class="option-card-pill border-pill" data-border="borda_cheddar" data-price="10.00">
                            <div class="option-title">Cheddar</div>
                            <div class="option-desc">Cremoso</div>
                            <div class="option-price">+R$ 10,00</div>
                        </div>
                        <div class="option-card-pill border-pill" data-border="borda_chocolate" data-price="12.00">
                            <div class="option-title">Chocolate</div>
                            <div class="option-desc">Vulcão Nobre</div>
                            <div class="option-price">+R$ 12,00</div>
                        </div>
                    </div>

                    <!-- Passo 3: Sabores e Divisão Meio-a-Meio -->
                    <div class="wizard-step-title">
                        <span class="step-number">3</span> Sabores & Divisão
                    </div>
                    <div class="flavor-selector-box">
                        <div class="flavor-mode-switch">
                            <button class="mode-btn active" id="btn-mode-whole">Pizza Inteira (1 Sabor)</button>
                            <button class="mode-btn" id="btn-mode-half">Meio a Meio (2 Sabores)</button>
                        </div>

                        <!-- Modo Inteiro -->
                        <div id="whole-flavor-container">
                            <label class="half-label">Escolha o Sabor da Pizza</label>
                            <select class="flavor-dropdown" id="select-flavor-whole"></select>
                        </div>

                        <!-- Modo Meio a Meio -->
                        <div id="halves-flavors-container" class="halves-config-container" style="display:none;">
                            <div class="half-box">
                                <div class="half-label">Metade 1 (Esquerda)</div>
                                <select class="flavor-dropdown" id="select-flavor-left"></select>
                            </div>
                            <div class="half-box">
                                <div class="half-label">Metade 2 (Direita)</div>
                                <select class="flavor-dropdown" id="select-flavor-right"></select>
                            </div>
                        </div>
                    </div>

                    <!-- Passo 4: Ingredientes Modulares 3D -->
                    <div class="wizard-step-title">
                        <span class="step-number">4</span> Ajuste Fino de Recheios (3D)
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
                        Clique para adicionar ou remover. Os itens caem e sobem em 3D em tempo real!
                    </div>
                    <div class="ingredients-interactive-list" id="ingredients-list-container">
                        <!-- Gerado dinamicamente -->
                    </div>

                </div>

                <!-- Rodapé Fixo do Customizador -->
                <div class="customizer-footer-bar">
                    <div class="footer-price-col">
                        <span class="footer-price-label">Valor Total da Pizza</span>
                        <span class="footer-price-val" id="customizer-current-price">R$ 69,90</span>
                    </div>
                    <button class="btn-add-cart-3d" id="btn-add-to-cart">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Adicionar ao Carrinho 3D
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ============================================================
         5. DRAWER DO CARRINHO 3D (Com Pizza e Refrigerante Juntos)
         ============================================================ -->
    <div class="cart-drawer-modal" id="cart-drawer-modal">
        <div class="cart-drawer">
            <div class="cart-drawer-header">
                <div class="cart-drawer-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    Carrinho 3D • Mesa Gastronômica
                </div>
                <button class="btn-icon-round" id="btn-close-cart" style="width:34px; height:34px;">✕</button>
            </div>

            <!-- Visualizador 3D do Carrinho (Pizza + Refrigerante na mesa) -->
            <div class="cart-3d-scene-container">
                <span class="cart-3d-badge">🍽️ CENA 3D DO COMBO</span>
                <div id="cart-3d-canvas-box" style="width:100%; height:100%;"></div>
            </div>

            <!-- Itens do Carrinho -->
            <div class="cart-items-scroll" id="cart-items-list">
                <!-- Preenchido via app.js -->
            </div>

            <!-- Resumo e Finalização -->
            <div class="cart-checkout-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span id="cart-subtotal-val">R$ 0,00</span>
                </div>
                <div class="summary-row">
                    <span>Taxa de entrega</span>
                    <span id="cart-fee-val">R$ 3,99</span>
                </div>
                <div class="summary-row total">
                    <span>Total do Pedido</span>
                    <span class="total-price" id="cart-total-val">R$ 0,00</span>
                </div>
                <button class="btn-checkout-confirm" id="btn-checkout">
                    Confirmar e Fazer Pedido
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- ============================================================
         6. MODAL DE RASTREAMENTO DO PEDIDO (Fluxograma Stepper)
         Fielmente Inspirado na Imagem de Referência 1
         ============================================================ -->
    <div class="order-tracking-modal" id="order-tracking-modal">
        <div class="tracking-card">
            <div class="tracking-header">
                <div style="font-family:var(--font-heading); font-weight:700; font-size:16px;">Detalhes do Pedido</div>
                <button class="btn-icon-round" id="btn-close-tracking" style="width:32px; height:32px;">✕</button>
            </div>
            <div class="tracking-scroll">
                
                <!-- Horário Previsto -->
                <div class="estimate-delivery-box">
                    <div class="estimate-label">Previsão para entrega</div>
                    <div class="estimate-time" id="tracking-estimate-time">20:50 - 21:05</div>
                </div>

                <!-- Título do Status -->
                <div style="font-weight:700; font-size:15px; margin-bottom:16px; display:flex; align-items:center; gap:8px;">
                    <span style="width:8px; height:8px; background:var(--accent-green); border-radius:50%; display:inline-block;"></span>
                    Status do pedido
                </div>

                <!-- Stepper Vertical (Fluxograma) -->
                <div class="stepper-container">
                    
                    <!-- Passo 1 -->
                    <div class="stepper-step">
                        <div class="step-node-col">
                            <div class="step-circle completed" id="step-node-realizado">✓</div>
                            <div class="step-line active" id="step-line-realizado"></div>
                        </div>
                        <div class="step-info">
                            <div class="step-title">Pedido realizado</div>
                            <div class="step-desc">Seu pedido foi enviado. Aguarde a confirmação do restaurante</div>
                        </div>
                    </div>

                    <!-- Passo 2 -->
                    <div class="stepper-step">
                        <div class="step-node-col">
                            <div class="step-circle" id="step-node-confirmado">⏱</div>
                            <div class="step-line" id="step-line-confirmado"></div>
                        </div>
                        <div class="step-info">
                            <div class="step-title">Pedido confirmado</div>
                            <div class="step-desc">Seu pedido foi confirmado pela cozinha</div>
                        </div>
                    </div>

                    <!-- Passo 3 -->
                    <div class="stepper-step">
                        <div class="step-node-col">
                            <div class="step-circle" id="step-node-preparacao">🍽</div>
                            <div class="step-line" id="step-line-preparacao"></div>
                        </div>
                        <div class="step-info">
                            <div class="step-title">Pedido em preparação</div>
                            <div class="step-desc">A massa e os recheios estão no forno a lenha</div>
                        </div>
                    </div>

                    <!-- Passo 4 -->
                    <div class="stepper-step">
                        <div class="step-node-col">
                            <div class="step-circle" id="step-node-rota">🛵</div>
                            <div class="step-line" id="step-line-rota"></div>
                        </div>
                        <div class="step-info">
                            <div class="step-title">Pedido em rota de entrega</div>
                            <div class="step-desc">O motoboy está a caminho do seu endereço</div>
                        </div>
                    </div>

                    <!-- Passo 5 -->
                    <div class="stepper-step">
                        <div class="step-node-col">
                            <div class="step-circle" id="step-node-finalizado">✔</div>
                        </div>
                        <div class="step-info">
                            <div class="step-title">Pedido finalizado</div>
                            <div class="step-desc">Entregue com sucesso! Bom apetite!</div>
                        </div>
                    </div>

                </div>

                <!-- Botão de Demonstração / Simulação -->
                <button class="btn-simulate-step" id="btn-simulate-order-step">
                    ⚡ Simular Próxima Etapa do Fluxograma
                </button>

                <!-- Resumo do Pedido Formatado -->
                <div class="tracking-order-summary">
                    <div class="order-code-badge">
                        <span id="tracking-order-code">Pedido nº 46596318</span>
                        <span style="font-size:11px; background:rgba(16,185,129,0.2); color:var(--accent-green); padding:3px 8px; border-radius:var(--radius-full);">ONLINE</span>
                    </div>
                    <div id="tracking-items-breakdown">
                        <!-- Preenchido via app.js -->
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- ============================================================
         7. BARRA DE NAVEGAÇÃO INFERIOR (App Style)
         ============================================================ -->
    <nav class="bottom-nav-bar">
        <button class="nav-item active" id="nav-home">
            <svg viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Cardápio
        </button>
        <button class="nav-item" id="nav-customizer">
            <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Montador 3D
        </button>
        <button class="nav-item" id="nav-cart">
            <div class="nav-badge" style="display:none;">0</div>
            <svg viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Carrinho 3D
        </button>
        <button class="nav-item" id="nav-orders">
            <svg viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            Rastreamento
        </button>
    </nav>

    <!-- Scripts e Bibliotecas 3D Locais (Vendor) -->
    <script src="assets/vendor/three.min.js"></script>
    <script src="assets/vendor/OrbitControls.js"></script>
    <script src="assets/vendor/gsap.min.js"></script>
    
    <!-- Orquestrador Modular ES6 -->
    <script type="module" src="assets/js/app.js"></script>
</body>
</html>
