/**
 * FoodMotion 3D - CartScene3D
 * Cena 3D Interativa do Carrinho Multi-Itens:
 * Exibe todos os produtos do pedido juntos (múltiplas pizzas empilhadas, fileira/pirâmide de latinhas e acompanhamentos).
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
        this.camera.position.set(0, 3.6, 5.2);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.95);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xfff7ed, 1.3);
        key.position.set(3, 8, 4);
        key.castShadow = true;
        key.shadow.mapSize.width = 1024;
        key.shadow.mapSize.height = 1024;
        this.scene.add(key);

        const fill = new THREE.DirectionalLight(0xe2e8f0, 0.55);
        fill.position.set(-4, 3, -2);
        this.scene.add(fill);

        const warmGlow = new THREE.PointLight(0xf59e0b, 0.7, 8);
        warmGlow.position.set(0, 2.5, -1);
        this.scene.add(warmGlow);
    }

    initControls() {
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 2.2;
            this.controls.maxDistance = 8.0;
            this.controls.target.set(0, 0.3, 0);
        }
    }

    buildTableSurface() {
        // Mesa rústica gastronômica em carvalho italiano
        const tableGeo = new THREE.CylinderGeometry(4.0, 4.0, 0.16, 48);
        const tableMat = new THREE.MeshStandardMaterial({
            color: 0x8b5a2b,
            roughness: 0.55,
            metalness: 0.05
        });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.y = -0.08;
        table.receiveShadow = true;
        this.tableGroup.add(table);
    }

    renderCartItems(cartItems, customPizzaSnapshot) {
        // Limpa itens 3D anteriores
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

        // 1. Coleta e renderiza TODAS as pizzas (com empilhamento tátil)
        const pizzaInstances = [];
        cartItems.forEach(item => {
            if (item.type === 'pizza') {
                for (let q = 0; q < item.quantity; q++) {
                    pizzaInstances.push({
                        name: item.name,
                        snapshot: item.snapshot || customPizzaSnapshot
                    });
                }
            }
        });

        // Se o carrinho não tiver pizza mas estivermos customizando uma, mostra ela
        if (pizzaInstances.length === 0 && customPizzaSnapshot) {
            pizzaInstances.push({ name: 'Pizza Customizada', snapshot: customPizzaSnapshot });
        }

        // Limite máximo de 3 pizzas empilhadas para manter proporção
        const maxPizzas = Math.min(pizzaInstances.length, 3);
        for (let i = 0; i < maxPizzas; i++) {
            const pData = pizzaInstances[i];
            const pizzaModel = this.buildMiniPizza(pData.snapshot);
            pizzaModel.name = 'CartDynamicItem';

            // Empilhamento: cada pizza sobe no eixo Y com leve rotação
            const stackY = i * 0.26;
            const stackRotation = i * 0.12;
            const offsetX = -1.1 + (i * 0.04);
            const offsetZ = 0.05 - (i * 0.04);

            pizzaModel.position.set(offsetX, stackY, offsetZ);
            pizzaModel.rotation.y = stackRotation;
            pizzaModel.scale.set(0.60, 0.60, 0.60);
            this.tableGroup.add(pizzaModel);

            // Animação de queda suave
            if (window.gsap) {
                pizzaModel.position.y = stackY + 1.2;
                gsap.to(pizzaModel.position, {
                    y: stackY,
                    duration: 0.6 + (i * 0.1),
                    delay: i * 0.08,
                    ease: "bounce.out"
                });
            }
        }

        // 2. Coleta e renderiza TODAS as bebidas (dispostas em cluster / fileira)
        const drinkInstances = [];
        cartItems.forEach(item => {
            if (item.type === 'drink') {
                for (let q = 0; q < item.quantity; q++) {
                    drinkInstances.push(item.name || 'Coca-Cola');
                }
            }
        });

        // Limite máximo de 5 latinhas/garrafas na mesa
        const maxDrinks = Math.min(drinkInstances.length, 5);
        const drinkPositions = [
            { x: 1.15, z: 0.35 },
            { x: 1.65, z: 0.05 },
            { x: 1.25, z: -0.45 },
            { x: 1.80, z: -0.45 },
            { x: 0.90, z: -0.15 }
        ];

        for (let i = 0; i < maxDrinks; i++) {
            const drinkName = drinkInstances[i];
            const drinkModel = this.buildCan3D(drinkName);
            drinkModel.name = 'CartDynamicItem';

            const pos = drinkPositions[i] || { x: 1.3 + (i * 0.2), z: 0 };
            drinkModel.position.set(pos.x, 0, pos.z);
            drinkModel.scale.set(0.80, 0.80, 0.80);
            this.tableGroup.add(drinkModel);

            if (window.gsap) {
                drinkModel.position.y = 1.0;
                gsap.to(drinkModel.position, {
                    y: 0,
                    duration: 0.65,
                    delay: 0.1 + (i * 0.06),
                    ease: "bounce.out"
                });
            }
        }

        // 3. Coleta e renderiza Acompanhamentos (Batatas)
        const sideInstances = [];
        cartItems.forEach(item => {
            if (item.type === 'side') {
                for (let q = 0; q < item.quantity; q++) {
                    sideInstances.push(item);
                }
            }
        });

        const maxSides = Math.min(sideInstances.length, 2);
        const sidePositions = [
            { x: 0.2, z: 1.25 },
            { x: 0.8, z: 1.35 }
        ];

        for (let i = 0; i < maxSides; i++) {
            const sideModel = this.buildFriesBasket();
            sideModel.name = 'CartDynamicItem';
            const pos = sidePositions[i];
            sideModel.position.set(pos.x, 0, pos.z);
            sideModel.scale.set(0.68, 0.68, 0.68);
            this.tableGroup.add(sideModel);

            if (window.gsap) {
                sideModel.position.y = 0.9;
                gsap.to(sideModel.position, {
                    y: 0,
                    duration: 0.65,
                    delay: 0.2 + (i * 0.08),
                    ease: "bounce.out"
                });
            }
        }
    }

    buildMiniPizza(snapshot) {
        const group = new THREE.Group();

        // Tábua de madeira redonda
        const boardGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.1, 36);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.65 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = 0.05;
        board.receiveShadow = true;
        group.add(board);

        // Massa base
        const doughGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.08, 36);
        const doughMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.8 });
        const dough = new THREE.Mesh(doughGeo, doughMat);
        dough.position.y = 0.12;
        dough.castShadow = true;
        group.add(dough);

        // Borda Recheada correspondente
        let crustColor = 0xc27803;
        if (snapshot && snapshot.border === 'borda_catupiry') crustColor = 0xfef08a;
        if (snapshot && snapshot.border === 'borda_cheddar') crustColor = 0xf59e0b;
        if (snapshot && snapshot.border === 'borda_chocolate') crustColor = 0x451a03;

        const crustGeo = new THREE.TorusGeometry(1.9, 0.19, 16, 36);
        const crustMat = new THREE.MeshStandardMaterial({ color: crustColor, roughness: 0.7 });
        const crust = new THREE.Mesh(crustGeo, crustMat);
        crust.rotation.x = Math.PI / 2;
        crust.position.y = 0.16;
        crust.castShadow = true;
        group.add(crust);

        // Molho & Queijo
        const sauceGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.02, 36);
        const sauceMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 });
        const sauce = new THREE.Mesh(sauceGeo, sauceMat);
        sauce.position.y = 0.16;
        group.add(sauce);

        const cheeseGeo = new THREE.CylinderGeometry(1.75, 1.75, 0.02, 36);
        const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });
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
            const r = 0.45 + (i % 3) * 0.45;
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

        let canColor = 0xe11d48;
        let canNameText = "COCA-COLA";
        const isGuarana = drinkName.toLowerCase().includes('guaraná') || drinkName.toLowerCase().includes('guarana');
        const isHeineken = drinkName.toLowerCase().includes('heineken') || drinkName.toLowerCase().includes('cerveja');

        if (isGuarana) {
            canColor = 0x059669;
            canNameText = "GUARANÁ";
        } else if (isHeineken) {
            canColor = 0x15803d;
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

        // Texto da marca sem emojis
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

        // Anel de abertura
        const tabGeo = new THREE.BoxGeometry(0.12, 0.015, 0.22);
        const tab = new THREE.Mesh(tabGeo, metalMat);
        tab.position.set(0, canHeight + 0.01, 0.08);
        tab.rotation.x = 0.08;
        group.add(tab);

        // Base chanfrada
        const baseGeo = new THREE.CylinderGeometry(canRadius, canRadius - 0.06, 0.06, 32);
        const base = new THREE.Mesh(baseGeo, metalMat);
        base.position.y = 0.03;
        group.add(base);

        return group;
    }

    buildFriesBasket() {
        const group = new THREE.Group();

        // Cesta de papel rústica
        const basketGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.6, 24);
        const basketMat = new THREE.MeshStandardMaterial({
            color: 0x9a3412,
            roughness: 0.6
        });
        const basket = new THREE.Mesh(basketGeo, basketMat);
        basket.position.y = 0.3;
        basket.castShadow = true;
        group.add(basket);

        // Batatas fritas douradas
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
