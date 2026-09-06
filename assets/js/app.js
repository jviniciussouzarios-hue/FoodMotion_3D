/**
 * FoodMotion 3D - Application Orchestrator
 * Integração da Vitrine, Customizador 3D (PizzaBuilder + IngredientManager),
 * Carrinho 3D Multi-Produtos (CartScene3D) e Rastreamento em Fluxograma.
 */

import { FoodProductEngine } from './engine/FoodProductEngine.js';
import { CartScene3D } from './engine/CartScene3D.js';

class FoodMotionApp {
    constructor() {
        this.restaurant = null;
        this.categories = [];
        this.pizzaFlavors = [];
        this.availableIngredients = [];

        this.engine3D = null;
        this.cartScene3D = null;

        // Estado do Carrinho
        this.cart = [];
        this.activeOrder = null;

        // Estado do Customizador Atual
        this.currentPizza = {
            productId: 1,
            size: 'grande',
            slices: 8,
            basePrice: 69.90,
            border: 'borda_tradicional',
            borderPrice: 0.00,
            isHalfAndHalf: false,
            flavorWhole: 'Calabresa Especial',
            flavorLeft: 'Calabresa Especial',
            flavorRight: 'Frango com Catupiry Original',
            activeIngredients: new Set(),
            extras: []
        };

        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.renderCatalog();
        this.setupNavigation();
        this.setupEventListeners();
    }

    async loadInitialData() {
        try {
            const [resRest, resIng] = await Promise.all([
                fetch('api/restaurants.php').then(r => r.json()),
                fetch('api/ingredients.php').then(r => r.json())
            ]);

            if (resRest.success) {
                this.restaurant = resRest.restaurant;
                this.categories = resRest.categories;
                this.pizzaFlavors = resRest.pizza_flavors;
                this.updateRestaurantHeader();
            }

            if (resIng.success) {
                this.availableIngredients = resIng.ingredients;
            }
        } catch (e) {
            console.error("Erro ao carregar dados iniciais:", e);
        }
    }

    updateRestaurantHeader() {
        if (!this.restaurant) return;
        const titleEl = document.getElementById('restaurant-name');
        const addrEl = document.getElementById('restaurant-address');
        const hoursEl = document.getElementById('restaurant-hours');
        const feeEl = document.getElementById('delivery-fee-badge');

        if (titleEl) titleEl.innerText = this.restaurant.name;
        if (addrEl) addrEl.innerText = this.restaurant.address;
        if (hoursEl) hoursEl.innerText = this.restaurant.opening_hours;
        if (feeEl) feeEl.innerText = `Taxa: R$ ${parseFloat(this.restaurant.delivery_fee).toFixed(2).replace('.', ',')}`;
    }

    renderCatalog() {
        const catBar = document.getElementById('category-tabs-container');
        const catalogBox = document.getElementById('catalog-content');
        if (!catBar || !catalogBox) return;

        catBar.innerHTML = '';
        catalogBox.innerHTML = '';

        this.categories.forEach((cat, idx) => {
            // Aba da Categoria
            const tab = document.createElement('button');
            tab.className = `category-tab ${idx === 0 ? 'active' : ''}`;
            tab.innerText = cat.name;
            tab.onclick = () => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const targetSec = document.getElementById(`cat-section-${cat.id}`);
                if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };
            catBar.appendChild(tab);

            // Seção e Cards
            const sec = document.createElement('section');
            sec.id = `cat-section-${cat.id}`;
            sec.className = 'catalog-section';
            sec.style.marginBottom = '32px';

            const title = document.createElement('h2');
            title.className = 'section-title';
            title.innerText = cat.name;
            sec.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'products-grid';

            (cat.products || []).forEach(prod => {
                const card = document.createElement('div');
                card.className = 'product-card';

                const is3D = prod.is_customizable_3d == 1;
                const formattedPrice = `R$ ${parseFloat(prod.base_price).toFixed(2).replace('.', ',')}`;

                card.innerHTML = `
                    <div class="card-info">
                        <div class="card-title">${prod.name}</div>
                        <div class="card-desc">${prod.description || ''}</div>
                        <div class="card-price-row">
                            <span class="card-price">${formattedPrice}</span>
                            <button class="card-cta" data-id="${prod.id}">
                                ${is3D ? `
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg> Montar em 3D
                                ` : `
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg> Adicionar
                                `}
                            </button>
                        </div>
                    </div>
                    <div class="card-image-box">
                        <img src="${prod.image_url || 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=300&q=80'}" alt="${prod.name}">
                        ${is3D ? `<span class="card-badge-3d">3D INTERATIVO</span>` : ''}
                    </div>
                `;

                card.querySelector('.card-cta').addEventListener('click', () => {
                    if (is3D) {
                        this.openCustomizer(prod);
                    } else {
                        this.addDirectItemToCart(prod);
                    }
                });

                grid.appendChild(card);
            });

            sec.appendChild(grid);
            catalogBox.appendChild(sec);
        });
    }

    /* ============================================================
       MOTOR 3D: Abertura e Personalização da Pizza
       ============================================================ */
    openCustomizer(product) {
        const modal = document.getElementById('customizer-modal');
        modal.classList.add('active');

        // Inicializa motor 3D se ainda não foi criado
        if (!this.engine3D) {
            this.engine3D = new FoodProductEngine('customizer-canvas-box');
            this.setupCameraButtons();
        }

        // Configura pizza inicial
        this.currentPizza.productId = product.id;
        this.currentPizza.basePrice = parseFloat(product.base_price);
        this.currentPizza.slices = product.slices || 8;

        this.engine3D.pizzaBuilder.setSize(this.currentPizza.slices);
        this.populateFlavorsDropdown();
        this.applyFlavorIngredients(this.currentPizza.flavorWhole, 'full');
        this.renderIngredientsList();
        this.updateCustomizerPrice();
    }

    closeCustomizer() {
        const modal = document.getElementById('customizer-modal');
        modal.classList.remove('active');
    }

    setupCameraButtons() {
        const btn3D = document.getElementById('cam-preset-3d');
        const btnTop = document.getElementById('cam-preset-top');
        const btnSide = document.getElementById('cam-preset-side');
        const btnRotate = document.getElementById('cam-toggle-rotate');
        const btnUndo = document.getElementById('btn-undo-3d');
        const btnRedo = document.getElementById('btn-redo-3d');

        if (btn3D) btn3D.onclick = () => this.engine3D.setCameraPreset('three_quarter');
        if (btnTop) btnTop.onclick = () => this.engine3D.setCameraPreset('top');
        if (btnSide) btnSide.onclick = () => this.engine3D.setCameraPreset('side');
        if (btnRotate) {
            btnRotate.onclick = () => {
                const rotating = this.engine3D.toggleAutoRotate();
                btnRotate.classList.toggle('active', rotating);
            };
        }
        if (btnUndo) {
            btnUndo.onclick = () => {
                this.engine3D.ingredientManager.undo();
                this.renderIngredientsList();
                this.updateCustomizerPrice();
            };
        }
        if (btnRedo) {
            btnRedo.onclick = () => {
                this.engine3D.ingredientManager.redo();
                this.renderIngredientsList();
                this.updateCustomizerPrice();
            };
        }
    }

    populateFlavorsDropdown() {
        const selectWhole = document.getElementById('select-flavor-whole');
        const selectLeft = document.getElementById('select-flavor-left');
        const selectRight = document.getElementById('select-flavor-right');

        if (!selectWhole) return;

        const optionsHtml = this.pizzaFlavors.map(f => 
            `<option value="${f.name}" ${f.name === 'Calabresa Especial' ? 'selected' : ''}>${f.name} ${f.price_modifier > 0 ? `(+R$ ${parseFloat(f.price_modifier).toFixed(2)})` : ''}</option>`
        ).join('');

        selectWhole.innerHTML = optionsHtml;
        if (selectLeft) selectLeft.innerHTML = optionsHtml;
        if (selectRight) {
            selectRight.innerHTML = this.pizzaFlavors.map(f => 
                `<option value="${f.name}" ${f.name.includes('Catupiry') ? 'selected' : ''}>${f.name} ${f.price_modifier > 0 ? `(+R$ ${parseFloat(f.price_modifier).toFixed(2)})` : ''}</option>`
            ).join('');
        }

        selectWhole.onchange = (e) => {
            this.currentPizza.flavorWhole = e.target.value;
            this.applyFlavorIngredients(e.target.value, 'full');
        };

        if (selectLeft) {
            selectLeft.onchange = (e) => {
                this.currentPizza.flavorLeft = e.target.value;
                this.applyFlavorIngredients(e.target.value, 'left');
            };
        }

        if (selectRight) {
            selectRight.onchange = (e) => {
                this.currentPizza.flavorRight = e.target.value;
                this.applyFlavorIngredients(e.target.value, 'right');
            };
        }
    }

    setHalfAndHalfMode(isHalf) {
        this.currentPizza.isHalfAndHalf = isHalf;
        this.engine3D.pizzaBuilder.setDividerVisible(isHalf);

        const wholeBox = document.getElementById('whole-flavor-container');
        const halvesBox = document.getElementById('halves-flavors-container');
        const btnWhole = document.getElementById('btn-mode-whole');
        const btnHalf = document.getElementById('btn-mode-half');

        if (isHalf) {
            if (wholeBox) wholeBox.style.display = 'none';
            if (halvesBox) halvesBox.style.display = 'flex';
            if (btnWhole) btnWhole.classList.remove('active');
            if (btnHalf) btnHalf.classList.add('active');

            // Aplica sabores distintos para cada metade
            this.engine3D.ingredientManager.clearAll();
            this.applyFlavorIngredients(this.currentPizza.flavorLeft, 'left');
            this.applyFlavorIngredients(this.currentPizza.flavorRight, 'right');
        } else {
            if (wholeBox) wholeBox.style.display = 'block';
            if (halvesBox) halvesBox.style.display = 'none';
            if (btnWhole) btnWhole.classList.add('active');
            if (btnHalf) btnHalf.classList.remove('active');

            this.engine3D.ingredientManager.clearAll();
            this.applyFlavorIngredients(this.currentPizza.flavorWhole, 'full');
        }
        this.updateCustomizerPrice();
    }

    applyFlavorIngredients(flavorName, region) {
        const flavor = this.pizzaFlavors.find(f => f.name === flavorName);
        if (!flavor) return;

        // Limpa a região antes de adicionar novos recheios
        this.engine3D.ingredientManager.clearRegion(region);

        // Adiciona ingredientes do sabor
        const ings = flavor.default_ingredients || ['calabresa', 'cebola', 'azeitona'];
        ings.forEach(ingId => {
            this.engine3D.ingredientManager.addIngredient(ingId, region);
        });

        this.renderIngredientsList();
        this.updateCustomizerPrice();
    }

    renderIngredientsList() {
        const container = document.getElementById('ingredients-list-container');
        if (!container) return;

        container.innerHTML = '';
        const activeSummary = this.engine3D.ingredientManager.getSummary();

        // Ingredientes selecionáveis
        const toppings = this.availableIngredients.filter(i => i.category === 'recheio' || i.category === 'finalizacao');

        toppings.forEach(ing => {
            const isPresent = (activeSummary.byRegion.full[ing.id] > 0) || 
                              (activeSummary.byRegion.left[ing.id] > 0) || 
                              (activeSummary.byRegion.right[ing.id] > 0);

            const row = document.createElement('div');
            row.className = 'ingredient-row-item';

            row.innerHTML = `
                <div class="ing-name-box">
                    <span class="ing-color-dot" style="background-color: ${ing.color_hex};"></span>
                    <div>
                        <div class="ing-title">${ing.name}</div>
                        <small style="color: var(--text-dim);">${ing.price > 0 ? `+R$ ${parseFloat(ing.price).toFixed(2)}` : 'Incluso'}</small>
                    </div>
                </div>
                <div class="ing-action-btns">
                    <button class="btn-toggle-ing ${isPresent ? 'active' : 'removed'}">
                        ${isPresent ? `
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Incluso (Remover)
                        ` : `
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Adicionar
                        `}
                    </button>
                </div>
            `;

            row.querySelector('.btn-toggle-ing').onclick = () => {
                const targetRegion = this.currentPizza.isHalfAndHalf ? 'left' : 'full';
                if (isPresent) {
                    // Executa animação de subida (Rise) e remove
                    this.engine3D.ingredientManager.removeIngredient(ing.id);
                } else {
                    // Executa animação de queda (Drop) e adiciona
                    this.engine3D.ingredientManager.addIngredient(ing.id, targetRegion);
                }
                this.renderIngredientsList();
                this.updateCustomizerPrice();
            };

            container.appendChild(row);
        });
    }

    updateCustomizerPrice() {
        let price = this.currentPizza.basePrice + this.currentPizza.borderPrice;

        // Modificadores de sabor
        if (this.currentPizza.isHalfAndHalf) {
            const fl1 = this.pizzaFlavors.find(f => f.name === this.currentPizza.flavorLeft);
            const fl2 = this.pizzaFlavors.find(f => f.name === this.currentPizza.flavorRight);
            const mod1 = fl1 ? parseFloat(fl1.price_modifier) : 0;
            const mod2 = fl2 ? parseFloat(fl2.price_modifier) : 0;
            price += Math.max(mod1, mod2); // Padrão brasileiro: maior valor ou média
        } else {
            const fl = this.pizzaFlavors.find(f => f.name === this.currentPizza.flavorWhole);
            if (fl) price += parseFloat(fl.price_modifier);
        }

        this.currentPizza.calculatedPrice = price;

        const priceEl = document.getElementById('customizer-current-price');
        if (priceEl) {
            priceEl.innerText = `R$ ${price.toFixed(2).replace('.', ',')}`;
        }
    }

    addCustomPizzaToCart() {
        const title = this.currentPizza.isHalfAndHalf 
            ? `Pizza 1/2 ${this.currentPizza.flavorLeft} + 1/2 ${this.currentPizza.flavorRight}`
            : `Pizza ${this.currentPizza.flavorWhole}`;

        const borderLabel = this.currentPizza.border === 'borda_catupiry' ? 'Borda Catupiry' :
                           (this.currentPizza.border === 'borda_cheddar' ? 'Borda Cheddar' : 
                           (this.currentPizza.border === 'borda_chocolate' ? 'Borda Chocolate' : 'Borda Tradicional'));

        const snapshot = {
            border: this.currentPizza.border,
            slices: this.currentPizza.slices,
            isHalf: this.currentPizza.isHalfAndHalf,
            flavorWhole: this.currentPizza.flavorWhole,
            flavorLeft: this.currentPizza.flavorLeft,
            flavorRight: this.currentPizza.flavorRight,
            summary: this.engine3D.ingredientManager.getSummary()
        };

        const item = {
            id: 'pizza_' + Date.now(),
            type: 'pizza',
            name: title,
            details: `${borderLabel} • ${this.currentPizza.slices} Pedaços`,
            price: this.currentPizza.calculatedPrice,
            quantity: 1,
            snapshot: snapshot
        };

        this.cart.push(item);
        this.updateCartBadge();
        this.closeCustomizer();
        this.openCart();
    }

    addDirectItemToCart(prod) {
        const item = {
            id: 'item_' + Date.now(),
            type: prod.product_type,
            name: prod.name,
            details: prod.description || '',
            price: parseFloat(prod.base_price),
            quantity: 1
        };

        this.cart.push(item);
        this.updateCartBadge();
        this.openCart();
    }

    /* ============================================================
       CARRINHO 3D: Mesa gastronômica com Pizza e Bebida juntas
       ============================================================ */
    openCart() {
        const modal = document.getElementById('cart-drawer-modal');
        modal.classList.add('active');

        // Inicializa motor 3D do carrinho
        if (!this.cartScene3D) {
            this.cartScene3D = new CartScene3D('cart-3d-canvas-box');
        }

        // Renderiza itens no 3D
        const customPizzaItem = this.cart.find(i => i.type === 'pizza');
        const snapshot = customPizzaItem ? customPizzaItem.snapshot : null;
        this.cartScene3D.renderCartItems(this.cart, snapshot);

        this.renderCartItemsList();
    }

    closeCart() {
        const modal = document.getElementById('cart-drawer-modal');
        modal.classList.remove('active');
    }

    renderCartItemsList() {
        const listEl = document.getElementById('cart-items-list');
        const subtotalEl = document.getElementById('cart-subtotal-val');
        const feeEl = document.getElementById('cart-fee-val');
        const totalEl = document.getElementById('cart-total-val');

        if (!listEl) return;

        listEl.innerHTML = '';
        let subtotal = 0;

        if (this.cart.length === 0) {
            listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0;">Seu carrinho está vazio.<br>Escolha uma pizza no cardápio!</div>`;
        }

        this.cart.forEach((item, idx) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item-card';
            div.innerHTML = `
                <div class="cart-item-header">
                    <div class="cart-item-title">${item.name}</div>
                    <button class="btn-remove-item" style="background:none; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; padding:4px;" title="Remover item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-item-details">${item.details}</div>
                <div class="cart-item-footer">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="qty-btn" data-action="minus" style="width:24px; height:24px; border-radius:50%; background:#1e293b; color:#fff; border:1px solid #334155; cursor:pointer;">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-action="plus" style="width:24px; height:24px; border-radius:50%; background:#1e293b; color:#fff; border:1px solid #334155; cursor:pointer;">+</button>
                    </div>
                    <div style="font-family:var(--font-heading); font-weight:700; color:var(--accent-gold);">
                        R$ ${itemTotal.toFixed(2).replace('.', ',')}
                    </div>
                </div>
            `;

            div.querySelector('.btn-remove-item').onclick = () => {
                this.cart.splice(idx, 1);
                this.updateCartBadge();
                this.openCart();
            };

            div.querySelectorAll('.qty-btn').forEach(btn => {
                btn.onclick = () => {
                    const action = btn.getAttribute('data-action');
                    if (action === 'plus') item.quantity++;
                    else if (action === 'minus') {
                        item.quantity--;
                        if (item.quantity <= 0) {
                            this.cart.splice(idx, 1);
                        }
                    }
                    this.updateCartBadge();
                    this.openCart();
                };
            });

            listEl.appendChild(div);
        });

        const deliveryFee = this.restaurant ? parseFloat(this.restaurant.delivery_fee) : 3.99;
        const total = subtotal > 0 ? (subtotal + deliveryFee) : 0;

        if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        if (feeEl) feeEl.innerText = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
        if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    updateCartBadge() {
        const badges = document.querySelectorAll('.nav-badge');
        const count = this.cart.reduce((acc, item) => acc + item.quantity, 0);
        badges.forEach(b => {
            b.innerText = count;
            b.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    async submitOrder() {
        if (this.cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const subtotal = this.cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
        const deliveryFee = this.restaurant ? parseFloat(this.restaurant.delivery_fee) : 3.99;

        const customPizza = this.cart.find(i => i.type === 'pizza');

        const payload = {
            restaurant_id: 1,
            customer_name: 'Cliente VIP FoodMotion',
            customer_phone: '(13) 99784-1234',
            delivery_address: 'Avenida Presidente Kennedy, 6292',
            items: this.cart,
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            snapshot_3d: customPizza ? customPizza.snapshot : null
        };

        try {
            const res = await fetch('api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(r => r.json());

            if (res.success) {
                this.activeOrder = {
                    code: res.order_code,
                    estimated: res.estimated_delivery,
                    total: res.total,
                    status: res.status,
                    items: [...this.cart],
                    delivery_fee: deliveryFee,
                    subtotal: subtotal
                };

                // Limpa carrinho
                this.cart = [];
                this.updateCartBadge();
                this.closeCart();

                // Abre Tela de Rastreamento (Fluxograma)
                this.openTrackingModal(this.activeOrder);
            } else {
                alert('Erro ao enviar pedido: ' + res.error);
            }
        } catch (e) {
            console.error(e);
            alert('Erro de conexão ao processar pedido.');
        }
    }

    /* ============================================================
       FLUXOGRAMA DE RASTREAMENTO DO PEDIDO (Inspirado na Ref. 1)
       ============================================================ */
    openTrackingModal(order) {
        const modal = document.getElementById('order-tracking-modal');
        modal.classList.add('active');

        const timeEl = document.getElementById('tracking-estimate-time');
        const codeEl = document.getElementById('tracking-order-code');
        const itemsBox = document.getElementById('tracking-items-breakdown');

        if (timeEl) timeEl.innerText = order.estimated;
        if (codeEl) codeEl.innerText = `Pedido nº ${order.code}`;

        if (itemsBox) {
            itemsBox.innerHTML = order.items.map(item => `
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex; justify-content:space-between; font-weight:700;">
                        <span>${item.quantity}x ${item.name}</span>
                        <span style="color:var(--accent-gold);">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${item.details}</div>
                </div>
            `).join('') + `
                <div style="margin-top:12px; font-size:13px; color:var(--text-muted);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Subtotal</span>
                        <span>R$ ${order.subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <span>Taxa de entrega</span>
                        <span>R$ ${order.delivery_fee.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:var(--text-main); padding-top:6px; border-top:1px solid var(--border-subtle);">
                        <span>Total</span>
                        <span style="color:var(--accent-gold);">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            `;
        }

        this.updateStepperUI(order.status);
    }

    closeTrackingModal() {
        const modal = document.getElementById('order-tracking-modal');
        modal.classList.remove('active');
    }

    updateStepperUI(currentStatus) {
        const statusOrder = ['realizado', 'confirmado', 'preparacao', 'rota', 'finalizado'];
        const currentIdx = statusOrder.indexOf(currentStatus);

        statusOrder.forEach((st, idx) => {
            const stepEl = document.getElementById(`step-node-${st}`);
            const lineEl = document.getElementById(`step-line-${st}`);

            if (stepEl) {
                stepEl.classList.remove('completed', 'active');
                if (idx < currentIdx) {
                    stepEl.classList.add('completed');
                } else if (idx === currentIdx) {
                    stepEl.classList.add('active');
                }
            }

            if (lineEl) {
                lineEl.classList.toggle('active', idx < currentIdx);
            }
        });
    }

    async simulateNextStatus() {
        if (!this.activeOrder) return;

        try {
            const res = await fetch('api/orders.php?action=advance_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_code: this.activeOrder.code })
            }).then(r => r.json());

            if (res.success) {
                this.activeOrder.status = res.status;
                this.updateStepperUI(res.status);
            }
        } catch (e) {
            console.error("Erro ao simular status:", e);
        }
    }

    setupNavigation() {
        // Navegação Inferior
        document.getElementById('nav-home')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.getElementById('nav-customizer')?.addEventListener('click', () => {
            const firstPizza = (this.categories[0]?.products || []).find(p => p.is_customizable_3d == 1);
            if (firstPizza) this.openCustomizer(firstPizza);
        });

        document.getElementById('nav-cart')?.addEventListener('click', () => {
            this.openCart();
        });

        document.getElementById('nav-orders')?.addEventListener('click', () => {
            if (this.activeOrder) {
                this.openTrackingModal(this.activeOrder);
            } else {
                alert('Você ainda não tem nenhum pedido recente em andamento.');
            }
        });
    }

    setupEventListeners() {
        // Fechar modais
        document.getElementById('btn-close-customizer')?.addEventListener('click', () => this.closeCustomizer());
        document.getElementById('btn-close-cart')?.addEventListener('click', () => this.closeCart());
        document.getElementById('btn-close-tracking')?.addEventListener('click', () => this.closeTrackingModal());

        // Botões de Meio-a-Meio
        document.getElementById('btn-mode-whole')?.addEventListener('click', () => this.setHalfAndHalfMode(false));
        document.getElementById('btn-mode-half')?.addEventListener('click', () => this.setHalfAndHalfMode(true));

        // Seleção de Tamanho da Pizza
        document.querySelectorAll('.size-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                const slices = parseInt(pill.getAttribute('data-slices'));
                const price = parseFloat(pill.getAttribute('data-price'));
                this.currentPizza.slices = slices;
                this.currentPizza.basePrice = price;
                if (this.engine3D) this.engine3D.pizzaBuilder.setSize(slices);
                this.updateCustomizerPrice();
            });
        });

        // Seleção de Borda Recheada
        document.querySelectorAll('.border-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.border-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
                const borderType = pill.getAttribute('data-border');
                const borderPrice = parseFloat(pill.getAttribute('data-price'));
                this.currentPizza.border = borderType;
                this.currentPizza.borderPrice = borderPrice;
                if (this.engine3D) this.engine3D.pizzaBuilder.updateBorder(borderType);
                this.updateCustomizerPrice();
            });
        });

        // Adicionar Pizza Customizada ao Carrinho
        document.getElementById('btn-add-to-cart')?.addEventListener('click', () => {
            this.addCustomPizzaToCart();
        });

        // Finalizar Pedido no Carrinho
        document.getElementById('btn-checkout')?.addEventListener('click', () => {
            this.submitOrder();
        });

        // Simular Próxima Etapa no Fluxograma
        document.getElementById('btn-simulate-order-step')?.addEventListener('click', () => {
            this.simulateNextStatus();
        });
    }
}

// Inicializa a aplicação ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    window.app = new FoodMotionApp();
});
