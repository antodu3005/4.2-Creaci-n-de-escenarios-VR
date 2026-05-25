import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// Variables de entorno de Three.js
let scene, camera, renderer, controls;
const container = document.getElementById('canvas-container');

// Inicializar la aplicación
init();

function init() {
    // 1. Inicializar Escena
    scene = new THREE.Scene();

    // 2. Configurar la Cámara
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10); 

    // 3. Configurar el Renderizador con soporte WebXR (VR)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true; // Activa VR
    renderer.shadowMap.enabled = true; 
    container.appendChild(renderer.domElement);

    // Adjuntar el botón oficial de Realidad Virtual (¡Ahora importado correctamente!)
    document.body.appendChild(VRButton.createButton(renderer));

    // 4. Iluminación potente para el modelo
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Controles de Órbita
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;

    // 5.1 GUÍA VISUAL: Una rejilla en el suelo para comprobar que el entorno 3D funciona
    const gridHelper = new THREE.GridHelper(60, 60, 0x444444, 0x222222);
    scene.add(gridHelper);

    // 6. Cargador especializado apuntando a tu modelo
    const loader = new GLTFLoader();
    const rutaModelo = 'modelos/aulay8.glb'; 

    loader.load(
        rutaModelo,
        function (gltf) {
            const model = gltf.scene;
            
            // Script para calcular tamaño exacto del modelo y auto-centrarlo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Centrar el aula en los ejes X y Z, apoyando la base en el suelo Y = 0
            model.position.x += (model.position.x - center.x);
            model.position.z += (model.position.z - center.z);
            model.position.y += (model.position.y - box.min.y); 

            scene.add(model);
            console.log("¡Modelo aulay8.glb cargado con éxito!");
            console.log("Tamaño del modelo detectado: ", size);

            // Re-calcular la cámara según las dimensiones reales de tu aula
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.set(0, maxDim * 0.8, maxDim * 1.3);
            controls.target.set(0, size.y / 2, 0);
            controls.update();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% descargado');
        },
        function (error) {
            console.error('Error crítico al cargar el .glb:', error);
        }
    );

    // 7. Monitoreo de cambio de tamaño de ventana (Responsivo)
    window.addEventListener('resize', onWindowResize);

    // Iniciar bucle de animación interactivo
    renderer.setAnimationLoop(animate);
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    controls.update(); 
    renderer.render(scene, camera);
}