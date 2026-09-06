/**
 * FoodMotion 3D - PizzaBuilder
 * Construtor procedural da massa, borda, molho e queijo com materiais PBR realistas.
 */

export class PizzaBuilder {
    constructor(scene) {
        this.scene = scene;
        this.pizzaGroup = new THREE.Group();
        this.pizzaGroup.name = "PizzaBaseGroup";
        this.scene.add(this.pizzaGroup);

        this.radius = 2.2;
        this.doughMesh = null;
        this.crustMesh = null;
        this.sauceMesh = null;
        this.cheeseMesh = null;
        this.boardMesh = null;
        this.dividerLine = null;

        this.currentBorderType = 'borda_tradicional';
        this.currentDoughType = 'massa_tradicional';

        this.initMaterials();
        this.buildBoard();
        this.buildBasePizza();
        this.buildDivider();
    }

    initMaterials() {
        // Textura procedural para massa dourada assada
        const doughCanvas = document.createElement('canvas');
        doughCanvas.width = 512;
        doughCanvas.height = 512;
        const ctxD = doughCanvas.getContext('2d');
        ctxD.fillStyle = '#eab308';
        ctxD.fillRect(0, 0, 512, 512);
        // Manchas de assado
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 6 + 1;
            ctxD.fillStyle = Math.random() > 0.5 ? '#ca8a04' : '#a16207';
            ctxD.beginPath();
            ctxD.arc(x, y, r, 0, Math.PI * 2);
            ctxD.fill();
        }
        this.doughTexture = new THREE.CanvasTexture(doughCanvas);
        this.doughTexture.wrapS = THREE.RepeatWrapping;
        this.doughTexture.wrapT = THREE.RepeatWrapping;

        this.doughMat = new THREE.MeshStandardMaterial({
            color: 0xeab308,
            map: this.doughTexture,
            roughness: 0.85,
            metalness: 0.05
        });

        // Material da borda tradicional
        this.crustMat = new THREE.MeshStandardMaterial({
            color: 0xc27803,
            roughness: 0.75,
            metalness: 0.05
        });

        // Material do molho rústico de tomate
        this.sauceMat = new THREE.MeshStandardMaterial({
            color: 0xb91c1c,
            roughness: 0.35,
            metalness: 0.02
        });

        // Material de muçarela derretida
        const cheeseCanvas = document.createElement('canvas');
        cheeseCanvas.width = 512;
        cheeseCanvas.height = 512;
        const ctxC = cheeseCanvas.getContext('2d');
        ctxC.fillStyle = '#fef08a';
        ctxC.fillRect(0, 0, 512, 512);
        // Tostadinhos dourados no queijo
        for (let i = 0; i < 180; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 8 + 2;
            ctxC.fillStyle = Math.random() > 0.3 ? '#eab308' : '#b45309';
            ctxC.beginPath();
            ctxC.arc(x, y, r, 0, Math.PI * 2);
            ctxC.fill();
        }
        this.cheeseTexture = new THREE.CanvasTexture(cheeseCanvas);
        this.cheeseMat = new THREE.MeshStandardMaterial({
            color: 0xfef9c3,
            map: this.cheeseTexture,
            roughness: 0.45,
            metalness: 0.05
        });
    }

    buildBoard() {
        // Tábua de servir em madeira nobre
        const boardGeo = new THREE.CylinderGeometry(this.radius + 0.35, this.radius + 0.35, 0.12, 48);
        const boardMat = new THREE.MeshStandardMaterial({
            color: 0x543310,
            roughness: 0.6,
            metalness: 0.1
        });
        this.boardMesh = new THREE.Mesh(boardGeo, boardMat);
        this.boardMesh.position.y = -0.06;
        this.boardMesh.receiveShadow = true;
        this.pizzaGroup.add(this.boardMesh);

        // Alça da tábua
        const handleGeo = new THREE.BoxGeometry(0.5, 0.1, 1.2);
        const handleMesh = new THREE.Mesh(handleGeo, boardMat);
        handleMesh.position.set(0, -0.06, this.radius + 0.85);
        handleMesh.receiveShadow = true;
        this.pizzaGroup.add(handleMesh);
    }

    buildBasePizza() {
        // 1. Massa base
        const doughGeo = new THREE.CylinderGeometry(this.radius, this.radius, 0.08, 48);
        this.doughMesh = new THREE.Mesh(doughGeo, this.doughMat);
        this.doughMesh.position.y = 0.04;
        this.doughMesh.receiveShadow = true;
        this.doughMesh.castShadow = true;
        this.pizzaGroup.add(this.doughMesh);

        // 2. Borda externa (Torus)
        this.updateBorder('borda_tradicional');

        // 3. Molho de tomate
        const sauceGeo = new THREE.CylinderGeometry(this.radius - 0.18, this.radius - 0.18, 0.02, 48);
        this.sauceMesh = new THREE.Mesh(sauceGeo, this.sauceMat);
        this.sauceMesh.position.y = 0.085;
        this.sauceMesh.receiveShadow = true;
        this.pizzaGroup.add(this.sauceMesh);

        // 4. Camada de queijo derretido
        const cheeseGeo = new THREE.CylinderGeometry(this.radius - 0.22, this.radius - 0.22, 0.02, 48);
        this.cheeseMesh = new THREE.Mesh(cheeseGeo, this.cheeseMat);
        this.cheeseMesh.position.y = 0.095;
        this.cheeseMesh.receiveShadow = true;
        this.pizzaGroup.add(this.cheeseMesh);
    }

    buildDivider() {
        // Linha divisória sutil para indicar o modo Meio-a-Meio
        const lineGeo = new THREE.BoxGeometry(0.04, 0.03, (this.radius - 0.2) * 2);
        const lineMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 0.3,
            roughness: 0.5
        });
        this.dividerLine = new THREE.Mesh(lineGeo, lineMat);
        this.dividerLine.position.y = 0.11;
        this.dividerLine.visible = false;
        this.pizzaGroup.add(this.dividerLine);
    }

    setDividerVisible(visible) {
        if (this.dividerLine) {
            this.dividerLine.visible = visible;
        }
    }

    updateBorder(borderType) {
        this.currentBorderType = borderType;
        if (this.crustMesh) {
            this.pizzaGroup.remove(this.crustMesh);
            this.crustMesh.geometry.dispose();
        }

        let torusRadius = this.radius - 0.12;
        let tubeRadius = 0.18;
        let color = 0xc27803;

        if (borderType === 'borda_catupiry') {
            tubeRadius = 0.24;
            color = 0xfef08a;
        } else if (borderType === 'borda_cheddar') {
            tubeRadius = 0.24;
            color = 0xf59e0b;
        } else if (borderType === 'borda_chocolate') {
            tubeRadius = 0.23;
            color = 0x451a03;
        }

        const crustGeo = new THREE.TorusGeometry(torusRadius, tubeRadius, 20, 56);
        const crustMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.05
        });

        this.crustMesh = new THREE.Mesh(crustGeo, crustMat);
        this.crustMesh.rotation.x = Math.PI / 2;
        this.crustMesh.position.y = 0.09;
        this.crustMesh.castShadow = true;
        this.crustMesh.receiveShadow = true;
        this.pizzaGroup.add(this.crustMesh);
    }

    setSize(slices) {
        let scale = 1.0;
        if (slices === 4) scale = 0.76;
        else if (slices === 12) scale = 1.24;

        if (window.gsap) {
            gsap.to(this.pizzaGroup.scale, {
                x: scale,
                y: scale,
                z: scale,
                duration: 0.55,
                ease: "back.out(1.4)"
            });
        } else {
            this.pizzaGroup.scale.set(scale, scale, scale);
        }
    }
}
