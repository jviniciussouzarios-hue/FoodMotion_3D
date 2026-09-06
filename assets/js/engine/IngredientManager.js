/**
 * FoodMotion 3D - IngredientManager
 * Motor de ingredientes modulares 3D, animações de queda (drop) e subida (rise),
 * e confinamento espacial estrito de regiões (full, left, right).
 */

export class IngredientManager {
    constructor(scene, pizzaBuilder) {
        this.scene = scene;
        this.pizzaBuilder = pizzaBuilder;
        this.toppingsGroup = new THREE.Group();
        this.toppingsGroup.name = "ToppingsGroup";
        this.scene.add(this.toppingsGroup);

        // Armazena itens ativos: Array de { id, type, region, mesh }
        this.activeItems = [];

        // Histórico para Undo/Redo
        this.history = [];
        this.historyIndex = -1;

        this.initMaterials();
    }

    initMaterials() {
        this.materials = {
            calabresa: new THREE.MeshStandardMaterial({
                color: 0x991b1b,
                roughness: 0.45,
                metalness: 0.05
            }),
            cebola: new THREE.MeshStandardMaterial({
                color: 0xf3e8ff,
                roughness: 0.35,
                transparent: true,
                opacity: 0.88
            }),
            presunto: new THREE.MeshStandardMaterial({
                color: 0xf43f5e,
                roughness: 0.55
            }),
            azeitona: new THREE.MeshStandardMaterial({
                color: 0x1c1917,
                roughness: 0.25,
                metalness: 0.2
            }),
            manjericao: new THREE.MeshStandardMaterial({
                color: 0x15803d,
                roughness: 0.4,
                side: THREE.DoubleSide
            }),
            tomate: new THREE.MeshStandardMaterial({
                color: 0xef4444,
                roughness: 0.35
            }),
            champignon: new THREE.MeshStandardMaterial({
                color: 0xe7e5e4,
                roughness: 0.65
            }),
            bacon: new THREE.MeshStandardMaterial({
                color: 0x78350f,
                roughness: 0.5
            }),
            frango: new THREE.MeshStandardMaterial({
                color: 0xd97706,
                roughness: 0.6
            }),
            catupiry: new THREE.MeshStandardMaterial({
                color: 0xfef9c3,
                roughness: 0.3,
                metalness: 0.02
            }),
            milho: new THREE.MeshStandardMaterial({
                color: 0xfacc15,
                roughness: 0.3
            }),
            carne_seca: new THREE.MeshStandardMaterial({
                color: 0x7c2d12,
                roughness: 0.65
            }),
            oregano: new THREE.MeshStandardMaterial({
                color: 0x166534,
                roughness: 0.7
            })
        };
    }

    createMeshForType(type) {
        let group = new THREE.Group();
        const mat = this.materials[type] || this.materials.calabresa;

        switch (type) {
            case 'calabresa': {
                const geo = new THREE.CylinderGeometry(0.24, 0.24, 0.035, 24);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'cebola': {
                // Arco de anel de cebola
                const geo = new THREE.TorusGeometry(0.22, 0.025, 8, 24, Math.PI * 1.4);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.rotation.x = Math.PI / 2;
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'azeitona': {
                const geo = new THREE.SphereGeometry(0.12, 16, 12);
                geo.scale(1, 1.3, 1);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'manjericao': {
                // Folha curva de manjericão
                const shape = new THREE.Shape();
                shape.moveTo(0, 0);
                shape.quadraticCurveTo(0.15, 0.2, 0, 0.4);
                shape.quadraticCurveTo(-0.15, 0.2, 0, 0);
                const geo = new THREE.ShapeGeometry(shape);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.rotation.x = -Math.PI / 2;
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'tomate': {
                const geo = new THREE.CylinderGeometry(0.28, 0.28, 0.03, 24);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'champignon': {
                const hatGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.04, 16);
                const hat = new THREE.Mesh(hatGeo, mat);
                const stemGeo = new THREE.BoxGeometry(0.08, 0.03, 0.14);
                const stem = new THREE.Mesh(stemGeo, mat);
                stem.position.z = 0.12;
                group.add(hat);
                group.add(stem);
                group.castShadow = true;
                break;
            }
            case 'bacon': {
                const geo = new THREE.BoxGeometry(0.16, 0.06, 0.16);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'presunto': {
                const geo = new THREE.BoxGeometry(0.32, 0.025, 0.14);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'frango':
            case 'carne_seca': {
                const geo = new THREE.ConeGeometry(0.06, 0.24, 6);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.rotation.z = Math.PI / 2.3;
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'catupiry': {
                const geo = new THREE.SphereGeometry(0.14, 12, 10);
                geo.scale(1.4, 0.6, 1.4);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'milho': {
                const geo = new THREE.SphereGeometry(0.06, 8, 8);
                geo.scale(1.2, 0.9, 1);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.castShadow = true;
                group.add(mesh);
                break;
            }
            case 'oregano': {
                // Partículas minúsculas agrupadas
                for (let i = 0; i < 4; i++) {
                    const geo = new THREE.SphereGeometry(0.02, 4, 4);
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(
                        (Math.random() - 0.5) * 0.15,
                        0,
                        (Math.random() - 0.5) * 0.15
                    );
                    group.add(mesh);
                }
                break;
            }
            default: {
                const geo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);
                break;
            }
        }

        return group;
    }

    calculatePositions(region, count) {
        const positions = [];
        const maxRadius = 1.75;
        const minRadius = 0.2;
        let attempts = 0;

        while (positions.length < count && attempts < count * 40) {
            attempts++;
            let x, z;

            if (region === 'left') {
                // Metade esquerda: X estritamente negativo com margem
                const angle = Math.PI / 2 + Math.random() * Math.PI; // 90° a 270°
                const r = minRadius + Math.random() * (maxRadius - minRadius);
                x = r * Math.cos(angle);
                z = r * Math.sin(angle);
                if (x > -0.12) continue; // Confinamento garantido
            } else if (region === 'right') {
                // Metade direita: X estritamente positivo com margem
                const angle = -Math.PI / 2 + Math.random() * Math.PI; // -90° a 90°
                const r = minRadius + Math.random() * (maxRadius - minRadius);
                x = r * Math.cos(angle);
                z = r * Math.sin(angle);
                if (x < 0.12) continue; // Confinamento garantido
            } else {
                // Inteira (Full)
                const angle = Math.random() * Math.PI * 2;
                const r = minRadius + Math.random() * (maxRadius - minRadius);
                x = r * Math.cos(angle);
                z = r * Math.sin(angle);
            }

            // Evita sobreposição excessiva
            let tooClose = false;
            for (const pos of positions) {
                const dist = Math.hypot(pos.x - x, pos.z - z);
                if (dist < 0.32) {
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                positions.push({ x, z });
            }
        }

        return positions;
    }

    addIngredient(type, region = 'full', count = null) {
        // Define quantidade recomendada por tipo
        const defaultCounts = {
            calabresa: region === 'full' ? 18 : 10,
            cebola: region === 'full' ? 16 : 8,
            presunto: region === 'full' ? 14 : 7,
            azeitona: region === 'full' ? 12 : 6,
            manjericao: region === 'full' ? 12 : 6,
            tomate: region === 'full' ? 10 : 5,
            champignon: region === 'full' ? 14 : 7,
            bacon: region === 'full' ? 22 : 11,
            frango: region === 'full' ? 20 : 10,
            catupiry: region === 'full' ? 12 : 6,
            milho: region === 'full' ? 24 : 12,
            carne_seca: region === 'full' ? 18 : 9,
            oregano: region === 'full' ? 30 : 15
        };

        const targetCount = count || defaultCounts[type] || (region === 'full' ? 14 : 7);
        const positions = this.calculatePositions(region, targetCount);

        const newItems = [];
        positions.forEach((pos, idx) => {
            const mesh = this.createMeshForType(type);
            const targetY = 0.12 + Math.random() * 0.02; // Superfície do queijo
            const startY = 4.2 + Math.random() * 1.5; // Altura no ar

            // Posição inicial no céu
            mesh.position.set(pos.x, startY, pos.z);
            mesh.rotation.y = Math.random() * Math.PI * 2;
            mesh.rotation.x = (Math.random() - 0.5) * 0.2;
            mesh.rotation.z = (Math.random() - 0.5) * 0.2;
            mesh.scale.set(0.8, 0.8, 0.8);

            this.toppingsGroup.add(mesh);

            const item = {
                id: `${type}_${region}_${Date.now()}_${idx}`,
                type,
                region,
                mesh
            };
            this.activeItems.push(item);
            newItems.push(item);

            // Animação de Queda (Drop from sky) com GSAP
            if (window.gsap) {
                gsap.to(mesh.position, {
                    y: targetY,
                    duration: 0.75,
                    delay: idx * 0.035,
                    ease: "bounce.out"
                });
                gsap.to(mesh.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.75,
                    delay: idx * 0.035,
                    ease: "back.out(1.5)"
                });
            } else {
                mesh.position.y = targetY;
                mesh.scale.set(1, 1, 1);
            }
        });

        this.saveState();
        return newItems;
    }

    removeIngredient(type, region = null) {
        // Encontra itens que batem com tipo e (se especificado) região
        const itemsToRemove = this.activeItems.filter(item => {
            const matchesType = item.type === type;
            const matchesRegion = region ? (item.region === region || (region === 'full')) : true;
            return matchesType && matchesRegion;
        });

        if (itemsToRemove.length === 0) return;

        itemsToRemove.forEach((item, idx) => {
            const mesh = item.mesh;

            // Animação de Subida (Rise to sky) com GSAP
            if (window.gsap) {
                gsap.to(mesh.position, {
                    y: mesh.position.y + 3.0,
                    duration: 0.55,
                    delay: idx * 0.02,
                    ease: "power2.in"
                });
                gsap.to(mesh.rotation, {
                    y: mesh.rotation.y + Math.PI,
                    duration: 0.55,
                    delay: idx * 0.02
                });
                gsap.to(mesh.scale, {
                    x: 0.1,
                    y: 0.1,
                    z: 0.1,
                    duration: 0.55,
                    delay: idx * 0.02,
                    ease: "power2.in",
                    onComplete: () => {
                        this.toppingsGroup.remove(mesh);
                        this.disposeMesh(mesh);
                    }
                });
            } else {
                this.toppingsGroup.remove(mesh);
                this.disposeMesh(mesh);
            }
        });

        // Atualiza a lista de itens ativos
        this.activeItems = this.activeItems.filter(item => !itemsToRemove.includes(item));
        this.saveState();
    }

    clearRegion(region) {
        const itemsToRemove = this.activeItems.filter(item => region === 'full' || item.region === region);
        itemsToRemove.forEach(item => {
            this.toppingsGroup.remove(item.mesh);
            this.disposeMesh(item.mesh);
        });
        this.activeItems = this.activeItems.filter(item => !itemsToRemove.includes(item));
    }

    clearAll() {
        this.activeItems.forEach(item => {
            this.toppingsGroup.remove(item.mesh);
            this.disposeMesh(item.mesh);
        });
        this.activeItems = [];
    }

    disposeMesh(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
        if (obj.children) {
            obj.children.forEach(child => this.disposeMesh(child));
        }
    }

    getSummary() {
        // Retorna resumo estruturado de ingredientes ativos
        const summary = {
            total: this.activeItems.length,
            byRegion: {
                full: {},
                left: {},
                right: {}
            }
        };

        this.activeItems.forEach(item => {
            const reg = item.region || 'full';
            summary.byRegion[reg][item.type] = (summary.byRegion[reg][item.type] || 0) + 1;
        });

        return summary;
    }

    saveState() {
        // Guarda um snapshot limpo do estado
        const snapshot = this.activeItems.map(item => ({
            type: item.type,
            region: item.region
        }));

        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snapshot);
        this.historyIndex++;
    }

    canUndo() {
        return this.historyIndex > 0;
    }

    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    undo() {
        if (!this.canUndo()) return;
        this.historyIndex--;
        this.restoreState(this.history[this.historyIndex]);
    }

    redo() {
        if (!this.canRedo()) return;
        this.historyIndex++;
        this.restoreState(this.history[this.historyIndex]);
    }

    restoreState(snapshot) {
        this.clearAll();
        // Agrupa e recria
        const grouped = {};
        snapshot.forEach(item => {
            const key = `${item.type}_${item.region}`;
            grouped[key] = grouped[key] || { type: item.type, region: item.region, count: 0 };
            grouped[key].count++;
        });

        Object.values(grouped).forEach(g => {
            this.addIngredient(g.type, g.region, g.count);
        });
    }
}
