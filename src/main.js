import { stateManager } from './core/state.js';
import { qrGenerator } from './qr/qrGenerator.js';
import { artworkRenderer } from './artwork/artworkRenderer.js';
import { SceneManager } from './viewer3d/sceneManager.js';
import { ControlsManager } from './ui/controlsManager.js';
import { exportService } from './export/exportService.js';
import { showToast } from './ui/toast.js';
import { PRINT_SPEC } from './core/constants.js';

class PlaqueStudioApp {
  constructor() {
    this.sceneManager = null;
    this.controlsManager = new ControlsManager();
    this.isRendering = false;
    this.pendingRender = false;
    this.currentArtworkCanvas = null;
    this.debounceTimer = null;
  }

  async init() {
    console.log('🚀 Inicializando Estúdio de Placas 3D & Gerador de QR Code...');

    // 1. Inicializa gerenciador de controles e eventos da UI
    this.controlsManager.init();

    // 2. Inicializa o renderizador 3D
    const container3D = document.getElementById('three-canvas-container');
    if (container3D) {
      try {
        this.sceneManager = new SceneManager(container3D);
        this.sceneManager.init(stateManager.get('dimension'));
      } catch (err) {
        console.error('Falha ao inicializar WebGL 3D:', err);
        showToast('WebGL não disponível. Alternando para modo 2D.', 'warning');
        document.getElementById('btn-view-2d')?.click();
      }
    }

    // 3. Conecta eventos de estado
    this.bindStateEvents();

    // 4. Conecta ações de exportação e download de gabarito
    this.bindExportActions();

    // 5. Renderização inicial
    await this.updateArtwork();

    showToast('Estúdio pronto! Personalize sua placa e visualize em 3D.', 'info', 4000);
  }

  bindStateEvents() {
    // Atualização de arte quando QR Code ou Artwork mudam
    stateManager.on('change:qrCode', () => this.debouncedUpdateArtwork());
    stateManager.on('change:artwork', () => this.debouncedUpdateArtwork());

    // Atualização física quando dimensões mudam
    stateManager.on('change:dimension', (newDim) => {
      if (this.sceneManager) {
        this.sceneManager.rebuildPlaque(newDim);
      }
      this.debouncedUpdateArtwork();
    });

    // Controles de câmera e visão 3D
    stateManager.on('view.cameraPreset', (preset) => {
      if (this.sceneManager) {
        this.sceneManager.setCameraPreset(preset);
      }
    });

    stateManager.on('view.autoRotate', (enabled) => {
      if (this.sceneManager) {
        this.sceneManager.setAutoRotate(enabled);
      }
    });

    stateManager.on('camera:reset', () => {
      if (this.sceneManager) {
        this.sceneManager.resetCamera();
      }
    });

    // Conecta o modo de interação 3D (Girar vs Mover na Placa)
    stateManager.on('view.interactionMode', (mode) => {
      if (this.sceneManager) {
        this.sceneManager.setInteractionMode(mode);
      }
    });

    // Callbacks quando o usuário interage diretamente com o mouse na placa 3D
    if (this.sceneManager) {
      // Clique inicial na superfície 3D: seleciona QR Code ou Imagem automaticamente
      this.sceneManager.onSurfaceDragStart((data) => {
        const hitQR = this.controlsManager.isPointInQRCode(data.relX, data.relY);
        this.controlsManager.setDragTarget(hitQR ? 'qr' : 'image');
      });

      // Duplo clique na superfície 3D: centraliza o elemento clicado
      this.sceneManager.onSurfaceDblClick((data) => {
        const hitQR = this.controlsManager.isPointInQRCode(data.relX, data.relY);
        if (hitQR) {
          this.controlsManager.setDragTarget('qr');
          this.controlsManager.centerQRCode();
        } else {
          this.controlsManager.setDragTarget('image');
          this.controlsManager.centerImage();
        }
      });

      // Arrastar na placa 3D com o mouse com snap magnético
      this.sceneManager.onSurfaceDrag((data) => {
        const target = this.controlsManager.currentDragTarget;
        if (target === 'qr') {
          const curX = stateManager.get('qrCode.posX') !== undefined ? stateManager.get('qrCode.posX') : 50;
          const curY = stateManager.get('qrCode.posY') !== undefined ? stateManager.get('qrCode.posY') : 68;
          let newX = curX + (data.deltaU * 100);
          let newY = curY - (data.deltaV * 100);

          // Snap magnético suave ao centro (50%)
          if (Math.abs(newX - 50) <= 2.5) newX = 50;
          if (Math.abs(newY - 50) <= 2.5) newY = 50;

          newX = Math.round(Math.min(85, Math.max(15, newX)));
          newY = Math.round(Math.min(88, Math.max(15, newY)));
          stateManager.update('qrCode', { posX: newX, posY: newY });
          this.controlsManager.syncQRSliders(newX, newY, null);
        } else {
          const curOffX = stateManager.get('artwork.imageOffsetX') || 0;
          const curOffY = stateManager.get('artwork.imageOffsetY') || 0;
          let newOffX = curOffX + (data.deltaU * 120);
          let newOffY = curOffY - (data.deltaV * 120);

          // Snap magnético suave ao centro (0)
          if (Math.abs(newOffX) <= 3.5) newOffX = 0;
          if (Math.abs(newOffY) <= 3.5) newOffY = 0;

          newOffX = Math.round(Math.min(150, Math.max(-150, newOffX)));
          newOffY = Math.round(Math.min(150, Math.max(-150, newOffY)));
          stateManager.update('artwork', { imageOffsetX: newOffX, imageOffsetY: newOffY });
          this.controlsManager.syncImageSliders(null, newOffX, newOffY);
        }
      });

      this.sceneManager.onSurfaceZoom((delta) => {
        const curScale = stateManager.get('artwork.imageScale') || 1.0;
        const newScale = Math.min(4.0, Math.max(0.2, Number((curScale + delta).toFixed(2))));
        stateManager.set('artwork.imageScale', newScale);
        this.controlsManager.syncImageSliders(newScale, null, null);
      });
    }
  }

  debouncedUpdateArtwork() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updateArtwork();
    }, 80);
  }

  async updateArtwork() {
    if (this.isRendering) {
      this.pendingRender = true;
      return;
    }

    this.isRendering = true;

    try {
      const state = stateManager.get();
      const { widthMm, heightMm } = state.dimension;

      // Resolução de prévia balanceada
      const previewW = PRINT_SPEC.previewWidthPx;
      const previewH = Math.round((previewW * heightMm) / widthMm);

      let qrCanvas = null;
      const shouldRenderQR = state.artwork.mode === 'template_google' || 
        (state.artwork.mode === 'custom_upload' && state.qrCode.showOnUpload !== false);

      if (shouldRenderQR) {
        qrCanvas = await qrGenerator.generateQRCode(state.qrCode, 700);
      }

      this.currentArtworkCanvas = await artworkRenderer.renderArtwork(
        state.artwork,
        qrCanvas,
        state.dimension,
        {
          widthPx: previewW,
          heightPx: previewH,
          dpi: 150,
          includeCropMarks: false
        },
        state.qrCode
      );

      // Sincroniza textura com a placa 3D
      if (this.sceneManager) {
        this.sceneManager.updateArtworkTexture(this.currentArtworkCanvas);
      }

      // Sincroniza com a prévia 2D
      const canvas2D = document.getElementById('preview-2d-canvas');
      if (canvas2D) {
        canvas2D.width = previewW;
        canvas2D.height = previewH;
        const ctx2 = canvas2D.getContext('2d');
        ctx2.drawImage(this.currentArtworkCanvas, 0, 0);

        if (this.controlsManager) {
          this.controlsManager.updateGuidesOverlay();
          this.controlsManager.updateTransformBox();
        }
      }
    } catch (err) {
      console.error('Erro ao renderizar arte da placa:', err);
    } finally {
      this.isRendering = false;
      if (this.pendingRender) {
        this.pendingRender = false;
        this.updateArtwork();
      }
    }
  }

  bindExportActions() {
    const btnPng = document.getElementById('btn-download-png');
    const btnPdf = document.getElementById('btn-download-pdf');
    const btnPrint = document.getElementById('btn-direct-print');
    const btnTemplate = document.getElementById('btn-download-template');
    const btnTemplateTop = document.getElementById('btn-download-template-top');

    const handleDownloadTemplate = () => {
      exportService.downloadTemplate(stateManager.get('dimension'));
      showToast('Gabarito oficial em 300 DPI baixado com sucesso!', 'success');
    };

    if (btnTemplate) btnTemplate.addEventListener('click', handleDownloadTemplate);
    if (btnTemplateTop) btnTemplateTop.addEventListener('click', handleDownloadTemplate);

    btnPng.addEventListener('click', async () => {
      const originalText = btnPng.innerHTML;
      btnPng.disabled = true;
      btnPng.innerHTML = `<span>Gerando PNG 300 DPI...</span>`;
      try {
        await exportService.downloadPNG(stateManager.get());
        showToast('Download do PNG em 300 DPI concluído com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Erro ao exportar PNG em alta resolução.', 'error');
      } finally {
        btnPng.disabled = false;
        btnPng.innerHTML = originalText;
      }
    });

    btnPdf.addEventListener('click', async () => {
      const originalText = btnPdf.innerHTML;
      btnPdf.disabled = true;
      btnPdf.innerHTML = `<span>Gerando PDF Gráfica...</span>`;
      try {
        await exportService.downloadPDF(stateManager.get());
        showToast('Download do PDF vetorial (escala 1:1) concluído com sucesso!', 'success');
      } catch (err) {
        console.error(err);
        showToast('Erro ao exportar PDF.', 'error');
      } finally {
        btnPdf.disabled = false;
        btnPdf.innerHTML = originalText;
      }
    });

    btnPrint.addEventListener('click', async () => {
      try {
        showToast('Preparando documento para impressão direta...', 'info');
        await exportService.triggerPrint(stateManager.get());
      } catch (err) {
        console.error(err);
        showToast('Erro ao abrir diálogo de impressão.', 'error');
      }
    });
  }
}

// Inicializa a aplicação assim que o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  const app = new PlaqueStudioApp();
  app.init();
});
