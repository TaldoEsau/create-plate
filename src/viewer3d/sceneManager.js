import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createAcrylicPlaqueMesh } from './acrylicGeometry.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.plaqueGroup = null;
    this.stickerMesh = null;
    this.canvasTexture = null;
    this.animationFrameId = null;

    this.autoRotate = false;
    this.lastTime = 0;
    this.fpsCounter = 0;
    this.fpsTimer = 0;
    this.fpsElement = document.getElementById('fps-badge');

    // Suporte a arrastar com o mouse diretamente na placa 3D via Raycaster
    this.interactionMode = 'orbit'; // 'orbit' | 'drag'
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isDraggingSurface = false;
    this.dragStartUV = null;
    this.onSurfaceDragCallback = null;
    this.onSurfaceZoomCallback = null;
  }

  init(initialDimensions) {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Cena
    this.scene = new THREE.Scene();
    this.scene.background = null; // Fundo transparente com CSS radial gradient estúdio

    // 2. Câmera com ângulo agradável
    this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);

    // 3. Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.container.appendChild(this.renderer.domElement);

    // 4. Mapa de Ambiente para Reflexão PBR de Estúdio (Acrílico Cristal)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 5. Controles de Órbita 360°
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02; // Não atravessa a mesa
    this.controls.minDistance = 80;
    this.controls.maxDistance = 600;
    this.controls.target.set(0, 75, -10);

    // Define a câmera inicial em perspectiva frontal/isométrica elegante
    this.setCameraPreset('perspective', false);

    // 6. Iluminação de Estúdio calibrada
    this.setupLighting();

    // 7. Sombra de Contato na Mesa
    this.setupGround();

    // 8. Cria textura inicial padrão enquanto o gerador de arte carrega
    this.createPlaceholderTexture();

    // 9. Constrói a malha 3D do suporte em L
    this.rebuildPlaque(initialDimensions);

    // 10. Interações de mouse na superfície da placa 3D
    this.setupSurfaceInteraction();

    // 11. Listeners e Loop de animação
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.animate(0);
  }

  createPlaceholderTexture() {
    const placeholder = document.createElement('canvas');
    placeholder.width = 700;
    placeholder.height = 955;
    const ctx = placeholder.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, placeholder.width, placeholder.height);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gerando Arte...', placeholder.width / 2, placeholder.height / 2);

    this.canvasTexture = new THREE.CanvasTexture(placeholder);
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
  }

  setupLighting() {
    // Luz ambiente suave
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.7);
    this.scene.add(hemiLight);

    // Luz principal com projeção de sombras suaves
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(120, 200, 160);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 50;
    keyLight.shadow.camera.far = 600;
    keyLight.shadow.camera.left = -160;
    keyLight.shadow.camera.right = 160;
    keyLight.shadow.camera.top = 220;
    keyLight.shadow.camera.bottom = -50;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 2.0;
    this.scene.add(keyLight);

    // Luz de preenchimento frontal esquerda
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.7);
    fillLight.position.set(-140, 90, 140);
    this.scene.add(fillLight);

    // Luz de contorno superior (Rim Light) para destacar os chanfros e o brilho do acrílico
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    rimLight.position.set(0, 160, -160);
    this.scene.add(rimLight);
  }

  setupGround() {
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.ShadowMaterial({
      opacity: 0.35
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  rebuildPlaque(dimensions) {
    if (this.plaqueGroup) {
      this.scene.remove(this.plaqueGroup);
      this.plaqueGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }

    this.plaqueGroup = createAcrylicPlaqueMesh(dimensions);
    this.scene.add(this.plaqueGroup);

    this.stickerMesh = this.plaqueGroup.getObjectByName('StickerFace');

    // Se já houver textura criada, atribui ao novo adesivo
    if (this.canvasTexture && this.stickerMesh) {
      this.stickerMesh.material.map = this.canvasTexture;
      this.stickerMesh.material.needsUpdate = true;
    }

    const h = Number(dimensions.heightMm) || 150;
    if (this.controls) {
      this.controls.target.set(0, h * 0.48, -10);
      this.controls.update();
    }
  }

  updateArtworkTexture(canvas) {
    if (!canvas) return;

    if (!this.canvasTexture) {
      this.canvasTexture = new THREE.CanvasTexture(canvas);
      this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
      this.canvasTexture.generateMipmaps = true;
      this.canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;
      this.canvasTexture.magFilter = THREE.LinearFilter;
    } else {
      this.canvasTexture.image = canvas;
      this.canvasTexture.needsUpdate = true;
    }

    if (this.stickerMesh) {
      this.stickerMesh.material.map = this.canvasTexture;
      this.stickerMesh.material.needsUpdate = true;
    }
  }

  setupSurfaceInteraction() {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('pointerdown', (e) => {
      // Se estiver no modo 'drag' OU com a tecla Shift pressionada
      if (this.interactionMode === 'drag' || e.shiftKey) {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.stickerMesh ? this.raycaster.intersectObject(this.stickerMesh) : [];

        if (intersects.length > 0 && intersects[0].uv) {
          this.isDraggingSurface = true;
          this.dragStartUV = { ...intersects[0].uv };
          this.controls.enabled = false;
          canvas.style.cursor = 'grabbing';
          e.preventDefault();

          if (this.onSurfaceDragStartCallback) {
            this.onSurfaceDragStartCallback({
              relX: intersects[0].uv.x * 100,
              relY: (1 - intersects[0].uv.y) * 100
            });
          }
        }
      }
    });

    // Duplo clique na placa 3D para centralizar o elemento clicado (QR ou Imagem)
    canvas.addEventListener('dblclick', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.stickerMesh ? this.raycaster.intersectObject(this.stickerMesh) : [];

      if (intersects.length > 0 && intersects[0].uv) {
        const relX = intersects[0].uv.x * 100;
        const relY = (1 - intersects[0].uv.y) * 100;
        if (this.onSurfaceDblClickCallback) {
          this.onSurfaceDblClickCallback({ relX, relY });
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDraggingSurface && this.stickerMesh) {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.stickerMesh);

        if (intersects.length > 0 && intersects[0].uv) {
          const curUV = intersects[0].uv;
          const deltaU = curUV.x - this.dragStartUV.x;
          const deltaV = curUV.y - this.dragStartUV.y;
          this.dragStartUV = { ...curUV };

          if (this.onSurfaceDragCallback) {
            this.onSurfaceDragCallback({
              u: curUV.x,
              v: curUV.y,
              deltaU,
              deltaV
            });
          }
        }
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDraggingSurface) {
        this.isDraggingSurface = false;
        canvas.style.cursor = this.interactionMode === 'drag' ? 'grab' : 'default';
        if (this.interactionMode === 'orbit') {
          this.controls.enabled = true;
        }
      }
    });

    // Zoom da imagem com a roda do mouse quando em modo drag ou Shift
    canvas.addEventListener('wheel', (e) => {
      if (this.interactionMode === 'drag' || e.shiftKey) {
        e.preventDefault();
        if (this.onSurfaceZoomCallback) {
          const delta = e.deltaY < 0 ? 0.05 : -0.05;
          this.onSurfaceZoomCallback(delta);
        }
      }
    }, { passive: false });
  }

  setInteractionMode(mode) {
    this.interactionMode = mode;
    const canvas = this.renderer ? this.renderer.domElement : null;
    if (!canvas) return;

    if (mode === 'drag') {
      this.controls.enabled = false;
      canvas.style.cursor = 'grab';
    } else {
      this.controls.enabled = true;
      canvas.style.cursor = 'default';
    }
  }

  onSurfaceDragStart(callback) {
    this.onSurfaceDragStartCallback = callback;
  }

  onSurfaceDrag(callback) {
    this.onSurfaceDragCallback = callback;
  }

  onSurfaceDblClick(callback) {
    this.onSurfaceDblClickCallback = callback;
  }

  onSurfaceZoom(callback) {
    this.onSurfaceZoomCallback = callback;
  }

  setCameraPreset(preset, animate = true) {
    const presets = {
      perspective: { 
        pos: new THREE.Vector3(135, 105, 255), 
        target: new THREE.Vector3(0, 75, -10) 
      },
      front: { 
        pos: new THREE.Vector3(0, 75, 270), 
        target: new THREE.Vector3(0, 75, -10) 
      },
      side: { 
        pos: new THREE.Vector3(280, 75, -25), 
        target: new THREE.Vector3(0, 75, -25) 
      }
    };

    const targetConfig = presets[preset] || presets.perspective;

    if (this.camera) {
      this.camera.position.copy(targetConfig.pos);
    }
    if (this.controls) {
      this.controls.target.copy(targetConfig.target);
      this.controls.update();
    }
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
    if (this.controls) {
      this.controls.autoRotate = enabled;
      this.controls.autoRotateSpeed = 1.6;
    }
  }

  resetCamera() {
    this.setCameraPreset('perspective', true);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate(time) {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    // Medidor de FPS
    this.fpsCounter++;
    if (time - this.fpsTimer >= 1000) {
      if (this.fpsElement) {
        this.fpsElement.textContent = `${this.fpsCounter} FPS`;
      }
      this.fpsCounter = 0;
      this.fpsTimer = time;
    }
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.remove();
      }
    }
  }
}
