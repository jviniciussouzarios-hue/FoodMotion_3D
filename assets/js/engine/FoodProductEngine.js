/**
 * FoodMotion 3D - FoodProductEngine
 * Motor central de visualização 3D da Pizza para personalização interativa.
 */

import { PizzaBuilder } from './PizzaBuilder.js';
import { IngredientManager } from './IngredientManager.js';

export class FoodProductEngine {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container) {
            throw new Error(`Container com ID '${canvasContainerId}' não encontrado.`);
        }

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pizzaBuilder = null;
        this.ingredientManager = null;
        this.isAutoRotating = false;

        this.initScene();
        this.initLights();
        this.initControls();
        this.initComponents();
        this.setupResizeListener();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();

        // Câmera em perspectiva
        this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 3.8, 4.5);

        // Renderizador WebGL com sombras suaves e antialias
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
        // Luz Ambiente Quente
        const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.7);
        this.scene.add(ambientLight);

        // Luz Principal (Key Light com sombras projetadas)
        const keyLight = new THREE.DirectionalLight(0xffedd5, 1.1);
        keyLight.position.set(4, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 20;
        keyLight.shadow.bias = -0.001;
        this.scene.add(keyLight);

        // Luz de Preenchimento (Fill Light)
        const fillLight = new THREE.DirectionalLight(0xf8fafc, 0.45);
        fillLight.position.set(-5, 4, -3);
        this.scene.add(fillLight);

        // Luz de Destaque Gastronômica (Warm Rim / Backlight)
        const rimLight = new THREE.PointLight(0xf59e0b, 0.8, 10);
        rimLight.position.set(0, 3, -3.5);
        this.scene.add(rimLight);
    }

    initControls() {
        if (THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2.05; // Não descer abaixo da tábua
            this.controls.minDistance = 2.5;
            this.controls.maxDistance = 8.0;
            this.controls.target.set(0, 0.1, 0);
        }
    }

    initComponents() {
        this.pizzaBuilder = new PizzaBuilder(this.scene);
        this.ingredientManager = new IngredientManager(this.scene, this.pizzaBuilder);
    }

    setCameraPreset(preset) {
        if (!window.gsap) return;

        let targetPos = { x: 0, y: 3.8, z: 4.5 };
        if (preset === 'top') {
            targetPos = { x: 0, y: 5.8, z: 0.1 };
        } else if (preset === 'side') {
            targetPos = { x: 0, y: 1.2, z: 4.8 };
        } else if (preset === 'three_quarter') {
            targetPos = { x: 2.8, y: 3.4, z: 3.6 };
        }

        gsap.to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 0.9,
            ease: "power2.inOut",
            onUpdate: () => {
                if (this.controls) this.controls.update();
            }
        });
    }

    toggleAutoRotate() {
        this.isAutoRotating = !this.isAutoRotating;
        if (this.controls) {
            this.controls.autoRotate = this.isAutoRotating;
            this.controls.autoRotateSpeed = 2.0;
        }
        return this.isAutoRotating;
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
