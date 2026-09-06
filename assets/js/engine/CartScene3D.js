/**
 * FoodMotion 3D - CartScene3D
 * Cena 3D Interativa do Carrinho:
 * Exibe todos os produtos do pedido juntos (ex: a pizza personalizada ao lado da lata de refrigerante 3D).
 */

export class CartScene3D {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container) return;

        this.width = this.container.clientWidth || 400;
        this.height = this.container.clientHeight || 320;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.tableGroup = new THREE.Group();

        this.initScene();
        this.initLights();
        this.initControls();
        this.buildTableSurface();
        this.setupResizeListener();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.add(this.tableGroup);

        this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 3.4, 4.8);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xfff7ed, 0.85);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffedd5, 1.2);
        key.position.set(3, 7, 4);
        key.castShadow = true;
        key.shadow.mapSize.width = 1024;
        key.shadow.mapSize.height = 1024;
        this.scene.add(key);

        const fill = new THREE.DirectionalLight(0x94a3b8, 0.4);
        fill.position.set(-4, 3, -2);
        this.scene.add(fill);

        const warmGlow = new THREE.PointLight(0xf59e0b, 0.8, 8);
        warmGlow.position.set(0, 2, -1);
        this.scene.add(warmGlow);
    }

    initControls() {
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 2.0;
            this.controls.maxDistance = 7.0;
            this.controls.target.set(0, 0.2, 0);
        }
    }

    buildTableSurface() {
        // Mesa rústica de restaurante
        const tableGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.15, 48);
        const tableMat = new THREE.MeshStandardMaterial({
            color: 0x3d2314,
            roughness: 0.7,
            metalness: 0.1
        });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.y = -0.075;
        table.receiveShadow = true;
        this.tableGroup.add(table);
    }

    renderCartItems(cartItems, customPizzaSnapshot) {
        // Limpa itens dinâmicos anteriores
        const toRemove = [];
        this.tableGroup.children.forEach(child => {
            if (child.name === 'CartDynamicItem') {
                toRemove.push(child);
            }
        });
        toRemove.forEach(child => {
            this.tableGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });

        // 1. Constrói a Pizza Personalizada na esquerda
        const hasPizza = cartItems.some(i => i.type === 'pizza') || customPizzaSnapshot;
        if (hasPizza) {
            const pizzaModel = this.buildMiniPizza(customPizzaSnapshot);
            pizzaModel.name = 'CartDynamicItem';
            pizzaModel.position.set(-1.0, 0, 0);
            pizzaModel.scale.set(0.62, 0.62, 0.62);
            this.tableGroup.add(pizzaModel);

            // Animação de entrada suave
            if (window.gsap) {
                pizzaModel.position.y = 1.0;
                gsap.to(pizzaModel.position, { y: 0, duration: 0.6, ease: "bounce.out" });
            }
        }

        // 2. Constrói a Bebida (Lata 3D / Garrafa) na direita
        const drinkItem = cartItems.find(i => i.type === 'drink') || { name: 'Coca-Cola' };
        if (drinkItem) {
            const drinkModel = this.buildCan3D(drinkItem.name || 'Coca-Cola');
            drinkModel.name = 'CartDynamicItem';
            drinkModel.position.set(1.25, 0, 0.2);
            drinkModel.scale.set(0.85, 0.85, 0.85);
            this.tableGroup.add(drinkModel);

            if (window.gsap) {
                drinkModel.position.y = 1.0;
                gsap.to(drinkModel.position, { y: 0, duration: 0.7, delay: 0.1, ease: "bounce.out" });
            }
        }

        // 3. Constrói Acompanhamento (se houver)
        const sideItem = cartItems.find(i => i.type === 'side');
        if (sideItem) {
            const sideModel = this.buildFriesBasket();
            sideModel.name = 'CartDynamicItem';
            sideModel.position.set(0.7, 0, 1.2);
            sideModel.scale.set(0.7, 0.7, 0.7);
            this.tableGroup.add(sideModel);

            if (window.gsap) {
                sideModel.position.y = 0.8;
                gsap.to(sideModel.position, { y: 0, duration: 0.65, delay: 0.2, ease: "bounce.out" });
            }
        }
    }

    buildMiniPizza(snapshot) {
        const group = new THREE.Group();

        // Tábua de madeira
        const boardGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.1, 32);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x543310, roughness: 0.6 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = 0.05;
        board.receiveShadow = true;
        group.add(board);

        // Massa
        const doughGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.08, 32);
        const doughMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.8 });
        const dough = new THREE.Mesh(doughGeo, doughMat);
        dough.position.y = 0.12;
        dough.castShadow = true;
        group.add(dough);

        // Borda
        let crustColor = 0xc27803;
        if (snapshot && snapshot.border === 'borda_catupiry') crustColor = 0xfef08a;
        if (snapshot && snapshot.border === 'borda_cheddar') crustColor = 0xf59e0b;
        if (snapshot && snapshot.border === 'borda_chocolate') crustColor = 0x451a03;

        const crustGeo = new THREE.TorusGeometry(1.9, 0.18, 16, 32);
        const crustMat = new THREE.MeshStandardMaterial({ color: crustColor, roughness: 0.7 });
        const crust = new THREE.Mesh(crustGeo, crustMat);
        crust.rotation.x = Math.PI / 2;
        crust.position.y = 0.16;
        crust.castShadow = true;
        group.add(crust);

        // Molho & Queijo
        const sauceGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.02, 32);
        const sauceMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 });
        const sauce = new THREE.Mesh(sauceGeo, sauceMat);
        sauce.position.y = 0.16;
        group.add(sauce);

        const cheeseGeo = new THREE.CylinderGeometry(1.75, 1.75, 0.02, 32);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
        const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
        cheese.position.y = 0.17;
        group.add(cheese);

        // Ingredientes representativos da pizza configurada
        const calMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
        const basilMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
        const oliveMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.2 });

        // Fatias de calabresa/recheio
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const r = 0.5 + (i % 3) * 0.45;
            const cGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16);
            const cal = new THREE.Mesh(cGeo, calMat);
            cal.position.set(r * Math.cos(angle), 0.19, r * Math.sin(angle));
            cal.castShadow = true;
            group.add(cal);
        }

        // Folhas de manjericão e azeitonas
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + 0.3;
            const oGeo = new THREE.SphereGeometry(0.1, 12, 12);
            const olive = new THREE.Mesh(oGeo, oliveMat);
            olive.position.set(0.9 * Math.cos(angle), 0.23, 0.9 * Math.sin(angle));
            olive.castShadow = true;
            group.add(olive);
        }

        return group;
    }

    buildCan3D(drinkName) {
        const group = new THREE.Group();

        let canColor = 0xe11d48; // Vermelho Coca-Cola padrão
        let canNameText = "COCA-COLA";
        const isGuarana = drinkName.toLowerCase().includes('guaraná') || drinkName.toLowerCase().includes('guarana');
        const isHeineken = drinkName.toLowerCase().includes('heineken') || drinkName.toLowerCase().includes('cerveja');

        if (isGuarana) {
            canColor = 0x059669; // Verde Guaraná
            canNameText = "GUARANÁ";
        } else if (isHeineken) {
            canColor = 0x15803d; // Verde Heineken
            canNameText = "HEINEKEN";
        }

        // 1. Corpo cilíndrico de alumínio
        const canHeight = 1.35;
        const canRadius = 0.42;
        const bodyGeo = new THREE.CylinderGeometry(canRadius, canRadius, canHeight, 32);

        // Textura do rótulo da lata
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = isGuarana ? '#059669' : (isHeineken ? '#15803d' : '#dc2626');
        ctx.fillRect(0, 0, 512, 256);

        // Faixa metálica/brilho
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(80, 0, 100, 256);

        // Texto da marca
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 46px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(canNameText, 256, 140);
        ctx.font = '22px Inter, sans-serif';
        ctx.fillText('350ml • GELADA', 256, 180);

        const canTexture = new THREE.CanvasTexture(canvas);
        const bodyMat = new THREE.MeshStandardMaterial({
            map: canTexture,
            roughness: 0.25,
            metalness: 0.65
        });

        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = canHeight / 2;
        body.castShadow = true;
        group.add(body);

        // 2. Tampa e Borda Superior de Alumínio Polido
        const rimGeo = new THREE.TorusGeometry(canRadius, 0.03, 12, 32);
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0xd1d5db,
            roughness: 0.15,
            metalness: 0.95
        });
        const rim = new THREE.Mesh(rimGeo, metalMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = canHeight;
        group.add(rim);

        // Tampa rebaixada
        const topCapGeo = new THREE.CylinderGeometry(canRadius - 0.02, canRadius - 0.02, 0.02, 32);
        const topCap = new THREE.Mesh(topCapGeo, metalMat);
        topCap.position.y = canHeight - 0.01;
        group.add(topCap);

        // Anel de abertura (Lacre da lata)
        const tabGeo = new THREE.BoxGeometry(0.12, 0.015, 0.22);
        const tab = new THREE.Mesh(tabGeo, metalMat);
        tab.position.set(0, canHeight + 0.01, 0.08);
        tab.rotation.x = 0.08;
        group.add(tab);

        // Base da lata chanfrada
        const baseGeo = new THREE.CylinderGeometry(canRadius, canRadius - 0.06, 0.06, 32);
        const base = new THREE.Mesh(baseGeo, metalMat);
        base.position.y = 0.03;
        group.add(base);

        return group;
    }

    buildFriesBasket() {
        const group = new THREE.Group();

        // Cesta rústica de papel / madeira
        const basketGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.6, 24);
        const basketMat = new THREE.MeshStandardMaterial({
            color: 0x9a3412,
            roughness: 0.6
        });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        basket.position.y = 0.3;
        basket.castShadow = true;
        group.add(basket);

        // Batatas fritas douradas espetadas
        const fryGeo = new THREE.BoxGeometry(0.08, 0.55, 0.08);
        const fryMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.4
        });

        for (let i = 0; i < 18; i++) {
            const fry = new THREE.Mesh(fryGeo, fryMat);
            fry.position.set(
                (Math.random() - 0.5) * 0.4,
                0.5 + Math.random() * 0.15,
                (Math.random() - 0.5) * 0.4
            );
            fry.rotation.set(
                (Math.random() - 0.5) * 0.35,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.35
            );
            fry.castShadow = true;
            group.add(fry);
        }

        return group;
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            if (!this.container) return;
            this.width = this.container.clientWidth;
            this.height = this.container.clientHeight;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }
}
