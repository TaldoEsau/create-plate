import { stateManager } from '../core/state.js';
import { showToast } from './toast.js';
import { DEFAULT_DIMENSIONS } from '../core/constants.js';

export class ControlsManager {
  constructor() {
    this.debounceTimers = new Map();
    this.currentDragTarget = 'image'; // 'image' | 'qr'
  }

  init() {
    this.bindTabNavigation();
    this.bindArtworkModeControls();
    this.bindGoogleTemplateControls();
    this.bindArtworkUploadControls();
    this.bindQRCodeControls();
    this.bindDimensionsControls();
    this.bindViewControls();
    this.bind2DCanvasDragging();
    this.bindTransformBoxHandles();
    this.bindScaleButtons();
  }

  debounce(key, fn, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    this.debounceTimers.set(key, setTimeout(fn, delay));
  }

  bindTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(targetTabId);
        if (targetPanel) targetPanel.classList.add('active');

        // Se abriu a aba do QR Code, define o alvo preferencial para o QR Code
        if (targetTabId === 'tab-content-qr') {
          this.setDragTarget('qr');
        } else if (targetTabId === 'tab-content-art') {
          this.setDragTarget('image');
        }
      });
    });
  }

  setDragTarget(target) {
    this.currentDragTarget = target;
    const btnImg2D = document.getElementById('btn-2d-drag-img');
    const btnQr2D = document.getElementById('btn-2d-drag-qr');

    if (target === 'qr') {
      btnQr2D?.classList.add('active');
      btnImg2D?.classList.remove('active');
    } else {
      btnImg2D?.classList.add('active');
      btnQr2D?.classList.remove('active');
    }

    this.updateGuidesOverlay();
    this.updateTransformBox();
  }

  getQRCodeBounds() {
    const state = stateManager.get();
    const qrConfig = state.qrCode || {};
    const { widthMm, heightMm } = state.dimension;
    const aspect = widthMm / heightMm; // W / H

    if (state.artwork.mode === 'custom_upload') {
      if (qrConfig.showOnUpload === false) return null;
      const sizePercent = qrConfig.sizePercent || 42;
      const posX = qrConfig.posX !== undefined ? qrConfig.posX : 50;
      const posY = qrConfig.posY !== undefined ? qrConfig.posY : 68;

      const halfW = (sizePercent * 1.16) / 2;
      const halfH = (sizePercent * aspect * 1.16) / 2;

      return {
        minX: Math.max(0, posX - halfW),
        maxX: Math.min(100, posX + halfW),
        minY: Math.max(0, posY - halfH),
        maxY: Math.min(100, posY + halfH),
        posX,
        posY,
        halfW,
        halfH
      };
    } else {
      const w = 700;
      const h = (700 * heightMm) / widthMm;
      const boxSize = 700 * 0.76;
      const boxX = (700 - boxSize) / 2;
      const boxY = 245;

      const minX = (boxX / w) * 100;
      const maxX = ((boxX + boxSize) / w) * 100;
      const minY = (boxY / h) * 100;
      const maxY = ((boxY + boxSize) / h) * 100;

      return {
        minX,
        maxX,
        minY,
        maxY,
        posX: 50,
        posY: (minY + maxY) / 2,
        halfW: (maxX - minX) / 2,
        halfH: (maxY - minY) / 2
      };
    }
  }

  isPointInQRCode(relX, relY) {
    const bounds = this.getQRCodeBounds();
    if (!bounds) return false;
    return (
      relX >= bounds.minX &&
      relX <= bounds.maxX &&
      relY >= bounds.minY &&
      relY <= bounds.maxY
    );
  }

  centerQRCode() {
    stateManager.update('qrCode', { posX: 50, posY: 50 });
    this.syncQRSliders(50, 50, null);

    const presetPosBtns = document.querySelectorAll('.btn-preset-pos');
    presetPosBtns.forEach(btn => {
      const px = Number(btn.getAttribute('data-pos-x'));
      const py = Number(btn.getAttribute('data-pos-y'));
      if (px === 50 && py === 50) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.updateGuidesOverlay();
    showToast('🎯 QR Code centralizado no meio da placa!', 'success');
  }

  centerImage() {
    stateManager.update('artwork', {
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0
    });
    this.syncImageSliders(1.0, 0, 0);
    this.updateGuidesOverlay();
    showToast('🎯 Imagem centralizada perfeitamente no modelo!', 'info');
  }

  centerCurrentSelection() {
    if (this.currentDragTarget === 'qr') {
      this.centerQRCode();
    } else {
      this.centerImage();
    }
  }

  updateGuidesOverlay(options = {}) {
    const guidesSvg = document.getElementById('preview-2d-guides');
    const badgeText = document.getElementById('selection-badge-text');
    if (!guidesSvg) return;

    let svgHtml = '';

    // Linhas de alinhamento magnético ao centro
    if (options.showSnapLines) {
      if (options.snappedX) {
        svgHtml += `<line x1="50" y1="0" x2="50" y2="100" class="guide-snap-line" />`;
      }
      if (options.snappedY) {
        svgHtml += `<line x1="0" y1="50" x2="100" y2="50" class="guide-snap-line" />`;
      }
    }

    if (this.currentDragTarget === 'qr') {
      const bounds = this.getQRCodeBounds();
      if (bounds) {
        const bw = bounds.maxX - bounds.minX;
        const bh = bounds.maxY - bounds.minY;
        svgHtml += `
          <rect x="${bounds.minX}" y="${bounds.minY}" width="${bw}" height="${bh}" rx="1.5" class="guide-selection-box" />
          <circle cx="${bounds.minX}" cy="${bounds.minY}" r="1.2" class="guide-handle" />
          <circle cx="${bounds.maxX}" cy="${bounds.minY}" r="1.2" class="guide-handle" />
          <circle cx="${bounds.minX}" cy="${bounds.maxY}" r="1.2" class="guide-handle" />
          <circle cx="${bounds.maxX}" cy="${bounds.maxY}" r="1.2" class="guide-handle" />
        `;
      }
      if (badgeText) {
        badgeText.textContent = '📱 QR Code Selecionado • Duplo clique para centralizar';
      }
    } else {
      // Imagem selecionada: desenha pequenos colchetes nos cantos da placa
      const c = 4;
      svgHtml += `
        <path d="M 2,${2 + c} L 2,2 L ${2 + c},2" class="guide-corner-bracket" />
        <path d="M ${98 - c},2 L 98,2 L 98,${2 + c}" class="guide-corner-bracket" />
        <path d="M 2,${98 - c} L 2,98 L ${2 + c},98" class="guide-corner-bracket" />
        <path d="M ${98 - c},98 L 98,98 L 98,${98 - c}" class="guide-corner-bracket" />
      `;
      if (badgeText) {
        badgeText.textContent = '🖼️ Imagem Selecionada • Duplo clique para centralizar';
      }
    }

    guidesSvg.innerHTML = svgHtml;
    this.updateTransformBox();
  }

  getImageBounds() {
    const state = stateManager.get();
    const config = state.artwork || {};
    const { widthMm, heightMm } = state.dimension;
    const canvasAspect = widthMm / heightMm;
    const scaleMult = config.imageScale !== undefined ? Number(config.imageScale) : 1.0;
    const offX = config.imageOffsetX || 0;
    const offY = config.imageOffsetY || 0;

    let imgAspect = canvasAspect;
    const imgUrl = config.customUploadedImageUrl;
    if (imgUrl) {
      const img = document.getElementById('artwork-preview-thumb');
      if (img && img.naturalWidth && img.naturalHeight) {
        imgAspect = img.naturalWidth / img.naturalHeight;
      }
    }

    const fitMode = config.fitMode || 'cover';
    let baseW_pct = 100;
    let baseH_pct = 100;

    if (fitMode === 'contain') {
      if (imgAspect > canvasAspect) {
        baseW_pct = 100;
        baseH_pct = 100 * (canvasAspect / imgAspect);
      } else {
        baseH_pct = 100;
        baseW_pct = 100 * (imgAspect / canvasAspect);
      }
    } else {
      if (imgAspect > canvasAspect) {
        baseH_pct = 100;
        baseW_pct = 100 * (imgAspect / canvasAspect);
      } else {
        baseW_pct = 100;
        baseH_pct = 100 * (canvasAspect / imgAspect);
      }
    }

    const drawW_pct = baseW_pct * scaleMult;
    const drawH_pct = baseH_pct * scaleMult;
    const drawX_pct = ((100 - drawW_pct) / 2) + offX;
    const drawY_pct = ((100 - drawH_pct) / 2) + offY;

    return {
      minX: drawX_pct,
      maxX: drawX_pct + drawW_pct,
      minY: drawY_pct,
      maxY: drawY_pct + drawH_pct,
      width: drawW_pct,
      height: drawH_pct
    };
  }

  getCurrentTransformBounds() {
    if (this.currentDragTarget === 'qr') {
      const bounds = this.getQRCodeBounds();
      if (!bounds) return { minX: 25, maxX: 75, minY: 40, maxY: 90, width: 50, height: 50 };
      return {
        minX: bounds.minX,
        maxX: bounds.maxX,
        minY: bounds.minY,
        maxY: bounds.maxY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY
      };
    } else {
      return this.getImageBounds();
    }
  }

  updateTransformBox() {
    const box = document.getElementById('transform-box');
    const pill = document.getElementById('transform-size-pill');
    if (!box) return;

    const bounds = this.getCurrentTransformBounds();
    if (!bounds) {
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';

    let bx = bounds.minX;
    let by = bounds.minY;
    let bw = bounds.width;
    let bh = bounds.height;

    // Para a imagem, mantemos as alças acessíveis e visíveis no enquadramento
    if (this.currentDragTarget === 'image') {
      bx = Math.max(1, Math.min(93, bounds.minX));
      by = Math.max(1, Math.min(93, bounds.minY));
      const r = Math.min(99, Math.max(bx + 6, bounds.maxX));
      const b = Math.min(99, Math.max(by + 6, bounds.maxY));
      bw = r - bx;
      bh = b - by;
    }

    box.style.left = `${bx}%`;
    box.style.top = `${by}%`;
    box.style.width = `${bw}%`;
    box.style.height = `${bh}%`;

    if (pill) {
      if (this.currentDragTarget === 'qr') {
        const sz = stateManager.get('qrCode.sizePercent') || 42;
        pill.textContent = `${sz}%`;
      } else {
        const sc = Math.round((stateManager.get('artwork.imageScale') || 1.0) * 100);
        pill.textContent = `${sc}%`;
      }
    }
  }

  bindTransformBoxHandles() {
    const box = document.getElementById('transform-box');
    const previewCanvas2D = document.getElementById('preview-2d-canvas');
    if (!box || !previewCanvas2D) return;

    const handles = box.querySelectorAll('.transform-handle');
    let isResizing = false;
    let activeHandle = null;
    let startX = 0;
    let startY = 0;
    let startScale = 1.0;
    let startSize = 42;

    handles.forEach(handle => {
      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        isResizing = true;
        activeHandle = handle.dataset.handle;
        startX = e.clientX;
        startY = e.clientY;
        startScale = stateManager.get('artwork.imageScale') || 1.0;
        startSize = stateManager.get('qrCode.sizePercent') || 42;

        box.classList.add('dragging');
        handle.setPointerCapture(e.pointerId);
      });

      handle.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        const rect = previewCanvas2D.getBoundingClientRect();
        const deltaX = ((e.clientX - startX) / rect.width) * 100;
        const deltaY = ((e.clientY - startY) / rect.height) * 100;

        let delta = 0;
        if (activeHandle === 'se') delta = (deltaX + deltaY) / 2;
        else if (activeHandle === 'nw') delta = (-deltaX - deltaY) / 2;
        else if (activeHandle === 'ne') delta = (deltaX - deltaY) / 2;
        else if (activeHandle === 'sw') delta = (-deltaX + deltaY) / 2;
        else if (activeHandle === 'e') delta = deltaX;
        else if (activeHandle === 'w') delta = -deltaX;
        else if (activeHandle === 's') delta = deltaY;
        else if (activeHandle === 'n') delta = -deltaY;

        if (this.currentDragTarget === 'image') {
          let newScale = startScale + (delta * 0.015);
          newScale = Math.min(4.0, Math.max(0.2, Number(newScale.toFixed(2))));
          stateManager.set('artwork.imageScale', newScale);
          this.syncImageSliders(newScale, null, null);
          this.updateTransformBox();
        } else {
          let newSize = startSize + (delta * 0.9);
          newSize = Math.round(Math.min(85, Math.max(15, newSize)));
          stateManager.set('qrCode.sizePercent', newSize);
          this.syncQRSliders(null, null, newSize);
          this.updateTransformBox();
        }
      });

      const stopResize = (e) => {
        if (isResizing) {
          isResizing = false;
          activeHandle = null;
          box.classList.remove('dragging');
          try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
          this.updateTransformBox();
        }
      };

      handle.addEventListener('pointerup', stopResize);
      handle.addEventListener('pointercancel', stopResize);
    });
  }

  bindScaleButtons() {
    const stepUp = () => {
      if (this.currentDragTarget === 'image') {
        const cur = stateManager.get('artwork.imageScale') || 1.0;
        const nxt = Math.min(4.0, Number((cur + 0.1).toFixed(2)));
        stateManager.set('artwork.imageScale', nxt);
        this.syncImageSliders(nxt, null, null);
        this.updateTransformBox();
        showToast(`Zoom da imagem: ${Math.round(nxt * 100)}%`, 'info', 1500);
      } else {
        const cur = stateManager.get('qrCode.sizePercent') || 42;
        const nxt = Math.min(85, cur + 3);
        stateManager.set('qrCode.sizePercent', nxt);
        this.syncQRSliders(null, null, nxt);
        this.updateTransformBox();
        showToast(`Tamanho do QR Code: ${nxt}%`, 'info', 1500);
      }
    };

    const stepDown = () => {
      if (this.currentDragTarget === 'image') {
        const cur = stateManager.get('artwork.imageScale') || 1.0;
        const nxt = Math.max(0.2, Number((cur - 0.1).toFixed(2)));
        stateManager.set('artwork.imageScale', nxt);
        this.syncImageSliders(nxt, null, null);
        this.updateTransformBox();
        showToast(`Zoom da imagem: ${Math.round(nxt * 100)}%`, 'info', 1500);
      } else {
        const cur = stateManager.get('qrCode.sizePercent') || 42;
        const nxt = Math.max(15, cur - 3);
        stateManager.set('qrCode.sizePercent', nxt);
        this.syncQRSliders(null, null, nxt);
        this.updateTransformBox();
        showToast(`Tamanho do QR Code: ${nxt}%`, 'info', 1500);
      }
    };

    document.getElementById('btn-scale-up')?.addEventListener('click', stepUp);
    document.getElementById('btn-scale-down')?.addEventListener('click', stepDown);
    document.getElementById('btn-micro-plus')?.addEventListener('click', stepUp);
    document.getElementById('btn-micro-minus')?.addEventListener('click', stepDown);

    // Botões stepper na sidebar
    document.getElementById('btn-step-img-plus')?.addEventListener('click', () => {
      const cur = stateManager.get('artwork.imageScale') || 1.0;
      const nxt = Math.min(4.0, Number((cur + 0.1).toFixed(2)));
      stateManager.set('artwork.imageScale', nxt);
      this.syncImageSliders(nxt, null, null);
      this.updateTransformBox();
    });

    document.getElementById('btn-step-img-minus')?.addEventListener('click', () => {
      const cur = stateManager.get('artwork.imageScale') || 1.0;
      const nxt = Math.max(0.2, Number((cur - 0.1).toFixed(2)));
      stateManager.set('artwork.imageScale', nxt);
      this.syncImageSliders(nxt, null, null);
      this.updateTransformBox();
    });

    document.getElementById('btn-step-qr-plus')?.addEventListener('click', () => {
      const cur = stateManager.get('qrCode.sizePercent') || 42;
      const nxt = Math.min(85, cur + 3);
      stateManager.set('qrCode.sizePercent', nxt);
      this.syncQRSliders(null, null, nxt);
      this.updateTransformBox();
    });

    document.getElementById('btn-step-qr-minus')?.addEventListener('click', () => {
      const cur = stateManager.get('qrCode.sizePercent') || 42;
      const nxt = Math.max(15, cur - 3);
      stateManager.set('qrCode.sizePercent', nxt);
      this.syncQRSliders(null, null, nxt);
      this.updateTransformBox();
    });
  }

  bindArtworkModeControls() {
    const modeCards = document.querySelectorAll('.mode-card');
    const groupTemplate = document.getElementById('group-template-fields');
    const groupUpload = document.getElementById('group-upload-fields');

    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        modeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const mode = radio.value;
          stateManager.set('artwork.mode', mode);

          if (mode === 'template_google') {
            groupTemplate.classList.remove('hidden');
            groupUpload.classList.add('hidden');
          } else {
            groupTemplate.classList.add('hidden');
            groupUpload.classList.remove('hidden');
            this.setDragTarget('image');
          }
        }
      });
    });
  }

  bindGoogleTemplateControls() {
    const titleLine1 = document.getElementById('input-title-line1');
    const titleBrand = document.getElementById('input-title-brand');
    const footerText = document.getElementById('input-footer-text');
    const toggleFrame = document.getElementById('toggle-google-frame');

    titleLine1.addEventListener('input', (e) => {
      this.debounce('title1', () => stateManager.set('artwork.titleLine1', e.target.value));
    });

    titleBrand.addEventListener('input', (e) => {
      this.debounce('brand', () => stateManager.set('artwork.titleBrand', e.target.value));
    });

    footerText.addEventListener('input', (e) => {
      this.debounce('footer', () => stateManager.set('artwork.footerCallout', e.target.value));
    });

    toggleFrame.addEventListener('change', (e) => {
      stateManager.set('artwork.showFrame', e.target.checked);
    });
  }

  bindArtworkUploadControls() {
    const dropzone = document.getElementById('artwork-dropzone');
    const fileInput = document.getElementById('artwork-file-input');
    const emptyContent = document.getElementById('dropzone-empty-content');
    const previewWrap = document.getElementById('dropzone-preview-wrap');
    const previewThumb = document.getElementById('artwork-preview-thumb');
    const fileNameText = document.getElementById('artwork-file-name');
    const btnRemove = document.getElementById('btn-remove-artwork');
    const selectFitMode = document.getElementById('select-fit-mode');

    ['dragenter', 'dragover'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length > 0) {
        this.handleArtworkFile(e.dataTransfer.files[0]);
      }
    });

    dropzone.addEventListener('click', (e) => {
      if (!e.target.closest('#btn-remove-artwork')) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        this.handleArtworkFile(fileInput.files[0]);
      }
    });

    btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      stateManager.set('artwork.customUploadedImageUrl', null);
      emptyContent.classList.remove('hidden');
      previewWrap.classList.add('hidden');
      showToast('Arte própria removida', 'info');
    });

    selectFitMode.addEventListener('change', (e) => {
      stateManager.set('artwork.fitMode', e.target.value);
    });

    // Controles de ajuste, enquadramento e centralização da imagem
    const rangeScale = document.getElementById('range-img-scale');
    const labelScale = document.getElementById('label-img-scale');
    const rangeOffsetX = document.getElementById('range-img-offset-x');
    const labelOffsetX = document.getElementById('label-img-offset-x');
    const rangeOffsetY = document.getElementById('range-img-offset-y');
    const labelOffsetY = document.getElementById('label-img-offset-y');
    const btnCenterImg = document.getElementById('btn-center-image');

    if (rangeScale) {
      rangeScale.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelScale) labelScale.textContent = `${val}%`;
        stateManager.set('artwork.imageScale', val / 100);
      });
    }

    if (rangeOffsetX) {
      rangeOffsetX.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelOffsetX) labelOffsetX.textContent = `${val}%`;
        stateManager.set('artwork.imageOffsetX', val);
      });
    }

    if (rangeOffsetY) {
      rangeOffsetY.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelOffsetY) labelOffsetY.textContent = `${val}%`;
        stateManager.set('artwork.imageOffsetY', val);
      });
    }

    if (btnCenterImg) {
      btnCenterImg.addEventListener('click', () => {
        stateManager.update('artwork', {
          imageScale: 1.0,
          imageOffsetX: 0,
          imageOffsetY: 0
        });
        this.syncImageSliders(1.0, 0, 0);
        showToast('Imagem perfeitamente centralizada no modelo 3D!', 'info');
      });
    }
  }

  handleArtworkFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, envie um arquivo de imagem válido (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      stateManager.set('artwork.customUploadedImageUrl', dataUrl);

      const emptyContent = document.getElementById('dropzone-empty-content');
      const previewWrap = document.getElementById('dropzone-preview-wrap');
      const previewThumb = document.getElementById('artwork-preview-thumb');
      const fileNameText = document.getElementById('artwork-file-name');

      previewThumb.src = dataUrl;
      fileNameText.textContent = file.name;
      emptyContent.classList.add('hidden');
      previewWrap.classList.remove('hidden');

      this.setDragTarget('image');
      showToast(`Arte "${file.name}" carregada com sucesso! Você pode arrastar para encaixar.`, 'success');
    };
    reader.readAsDataURL(file);
  }

  bindQRCodeControls() {
    const urlInput = document.getElementById('input-qr-url');
    const logoPills = document.querySelectorAll('.logo-pill-card');
    const customLogoWrap = document.getElementById('custom-logo-upload-wrap');
    const customLogoFile = document.getElementById('input-custom-logo-file');
    const logoMiniDropzone = document.getElementById('logo-mini-dropzone');
    const logoMiniText = document.getElementById('logo-mini-text');
    const roundedToggle = document.getElementById('toggle-qr-rounded');
    const colorPicker = document.getElementById('input-qr-color');
    const presetDots = document.querySelectorAll('.preset-dot');

    urlInput.addEventListener('input', (e) => {
      this.debounce('qrurl', () => {
        stateManager.set('qrCode.url', e.target.value || 'https://google.com');
      }, 400);
    });

    logoPills.forEach(pill => {
      pill.addEventListener('click', () => {
        logoPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const radio = pill.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const choice = radio.value;
          stateManager.set('qrCode.logoChoice', choice);

          if (choice === 'custom') {
            customLogoWrap.classList.remove('hidden');
          } else {
            customLogoWrap.classList.add('hidden');
          }
        }
      });
    });

    logoMiniDropzone.addEventListener('click', () => customLogoFile.click());
    customLogoFile.addEventListener('change', () => {
      if (customLogoFile.files.length > 0) {
        const file = customLogoFile.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          stateManager.set('qrCode.customLogoUrl', e.target.result);
          logoMiniText.textContent = `Logo: ${file.name}`;
          showToast('Logo central do QR Code atualizada!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    roundedToggle.addEventListener('change', (e) => {
      stateManager.set('qrCode.dotsStyle', e.target.checked ? 'rounded' : 'square');
    });

    colorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      stateManager.set('qrCode.fgColor', color);
      presetDots.forEach(d => d.classList.remove('active'));
    });

    presetDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const color = dot.getAttribute('data-color');
        colorPicker.value = color;
        presetDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        stateManager.set('qrCode.fgColor', color);
      });
    });

    // Posicionamento Livre do QR Code na Placa
    const toggleOverlay = document.getElementById('toggle-qr-overlay');
    const rangePosX = document.getElementById('range-qr-pos-x');
    const rangePosY = document.getElementById('range-qr-pos-y');
    const rangeSize = document.getElementById('range-qr-size');
    const toggleCardBg = document.getElementById('toggle-qr-card-bg');
    const presetPosBtns = document.querySelectorAll('.btn-preset-pos');

    if (toggleOverlay) {
      toggleOverlay.addEventListener('change', (e) => {
        stateManager.set('qrCode.showOnUpload', e.target.checked);
      });
    }

    if (rangePosX) {
      rangePosX.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        stateManager.set('qrCode.posX', val);
        this.syncQRSliders(val, null, null);
        presetPosBtns.forEach(b => b.classList.remove('active'));
      });
    }

    if (rangePosY) {
      rangePosY.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        stateManager.set('qrCode.posY', val);
        this.syncQRSliders(null, val, null);
        presetPosBtns.forEach(b => b.classList.remove('active'));
      });
    }

    if (rangeSize) {
      rangeSize.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        stateManager.set('qrCode.sizePercent', val);
        this.syncQRSliders(null, null, val);
      });
    }

    if (toggleCardBg) {
      toggleCardBg.addEventListener('change', (e) => {
        stateManager.set('qrCode.cardBackground', e.target.checked);
      });
    }

    const btnCenterQr = document.getElementById('btn-center-qr');
    if (btnCenterQr) {
      btnCenterQr.addEventListener('click', () => {
        this.centerQRCode();
      });
    }

    presetPosBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const px = Number(btn.getAttribute('data-pos-x'));
        const py = Number(btn.getAttribute('data-pos-y'));
        presetPosBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.syncQRSliders(px, py, null);
        stateManager.update('qrCode', { posX: px, posY: py });
        this.updateGuidesOverlay();
      });
    });
  }

  bind2DCanvasDragging() {
    const previewCanvas2D = document.getElementById('preview-2d-canvas');
    const btnImg2D = document.getElementById('btn-2d-drag-img');
    const btnQr2D = document.getElementById('btn-2d-drag-qr');
    const btnCenter2D = document.getElementById('btn-2d-center-current');

    if (btnImg2D) {
      btnImg2D.addEventListener('click', () => this.setDragTarget('image'));
    }
    if (btnQr2D) {
      btnQr2D.addEventListener('click', () => this.setDragTarget('qr'));
    }
    if (btnCenter2D) {
      btnCenter2D.addEventListener('click', () => this.centerCurrentSelection());
    }

    if (!previewCanvas2D) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startOffX = 0;
    let startOffY = 0;
    let startQrX = 50;
    let startQrY = 68;

    previewCanvas2D.addEventListener('pointerdown', (e) => {
      const rect = previewCanvas2D.getBoundingClientRect();
      const clickRelX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickRelY = ((e.clientY - rect.top) / rect.height) * 100;

      // Detecta com o mouse se o clique foi direto no QR Code ou na Imagem
      const hitQR = this.isPointInQRCode(clickRelX, clickRelY);
      this.setDragTarget(hitQR ? 'qr' : 'image');

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startOffX = stateManager.get('artwork.imageOffsetX') || 0;
      startOffY = stateManager.get('artwork.imageOffsetY') || 0;
      startQrX = stateManager.get('qrCode.posX') !== undefined ? stateManager.get('qrCode.posX') : 50;
      startQrY = stateManager.get('qrCode.posY') !== undefined ? stateManager.get('qrCode.posY') : 68;

      previewCanvas2D.style.cursor = 'grabbing';
      previewCanvas2D.setPointerCapture(e.pointerId);
    });

    previewCanvas2D.addEventListener('pointermove', (e) => {
      const rect = previewCanvas2D.getBoundingClientRect();

      if (!isDragging) {
        // Modo Hover: indica visualmente sob o cursor quem será selecionado
        const mouseRelX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseRelY = ((e.clientY - rect.top) / rect.height) * 100;
        if (this.isPointInQRCode(mouseRelX, mouseRelY)) {
          previewCanvas2D.style.cursor = 'move';
          previewCanvas2D.title = '📱 QR Code (Clique para mover • Duplo clique para centralizar)';
        } else {
          previewCanvas2D.style.cursor = 'grab';
          previewCanvas2D.title = '🖼️ Imagem (Clique para mover • Duplo clique para centralizar)';
        }
        return;
      }

      const deltaX = ((e.clientX - startX) / rect.width) * 100;
      const deltaY = ((e.clientY - startY) / rect.height) * 100;

      if (this.currentDragTarget === 'qr') {
        let newX = startQrX + deltaX;
        let newY = startQrY + deltaY;
        let snappedX = false;
        let snappedY = false;

        // Snap magnético suave ao centro horizontal e vertical (50%)
        if (Math.abs(newX - 50) <= 2.5) {
          newX = 50;
          snappedX = true;
        }
        if (Math.abs(newY - 50) <= 2.5) {
          newY = 50;
          snappedY = true;
        }

        newX = Math.round(Math.min(85, Math.max(15, newX)));
        newY = Math.round(Math.min(88, Math.max(15, newY)));
        stateManager.update('qrCode', { posX: newX, posY: newY });
        this.syncQRSliders(newX, newY, null);
        this.updateGuidesOverlay({ showSnapLines: true, snappedX, snappedY });
      } else {
        // Mover imagem
        let newOffX = startOffX + deltaX;
        let newOffY = startOffY + deltaY;
        let snappedX = false;
        let snappedY = false;

        // Snap magnético suave ao centro (0, 0)
        if (Math.abs(newOffX) <= 3.5) {
          newOffX = 0;
          snappedX = true;
        }
        if (Math.abs(newOffY) <= 3.5) {
          newOffY = 0;
          snappedY = true;
        }

        newOffX = Math.round(Math.min(150, Math.max(-150, newOffX)));
        newOffY = Math.round(Math.min(150, Math.max(-150, newOffY)));
        stateManager.update('artwork', { imageOffsetX: newOffX, imageOffsetY: newOffY });
        this.syncImageSliders(null, newOffX, newOffY);
        this.updateGuidesOverlay({ showSnapLines: true, snappedX, snappedY });
      }
    });

    const stopDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        previewCanvas2D.style.cursor = 'grab';
        try { previewCanvas2D.releasePointerCapture(e.pointerId); } catch (_) {}
        this.updateGuidesOverlay({ showSnapLines: false });
      }
    };

    previewCanvas2D.addEventListener('pointerup', stopDrag);
    previewCanvas2D.addEventListener('pointercancel', stopDrag);

    // Duplo clique com o mouse para centralizar o elemento clicado!
    previewCanvas2D.addEventListener('dblclick', (e) => {
      const rect = previewCanvas2D.getBoundingClientRect();
      const clickRelX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickRelY = ((e.clientY - rect.top) / rect.height) * 100;

      if (this.isPointInQRCode(clickRelX, clickRelY)) {
        this.setDragTarget('qr');
        this.centerQRCode();
      } else {
        this.setDragTarget('image');
        this.centerImage();
      }
    });

    // Zoom com roda do mouse na tela 2D (redimensiona o elemento ativo)
    previewCanvas2D.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.currentDragTarget === 'qr') {
        const curSize = stateManager.get('qrCode.sizePercent') || 42;
        const step = e.deltaY < 0 ? 2 : -2;
        const newSize = Math.min(85, Math.max(15, curSize + step));
        stateManager.set('qrCode.sizePercent', newSize);
        this.syncQRSliders(null, null, newSize);
      } else {
        const currentScale = stateManager.get('artwork.imageScale') || 1.0;
        const step = e.deltaY < 0 ? 0.05 : -0.05;
        const newScale = Math.min(4.0, Math.max(0.2, Number((currentScale + step).toFixed(2))));
        stateManager.set('artwork.imageScale', newScale);
        this.syncImageSliders(newScale, null, null);
      }
      this.updateTransformBox();
    }, { passive: false });
  }

  syncImageSliders(scale, offX, offY) {
    if (scale !== null && scale !== undefined) {
      const rangeScale = document.getElementById('range-img-scale');
      const labelScale = document.getElementById('label-img-scale');
      const perc = Math.round(scale * 100);
      if (rangeScale) rangeScale.value = perc;
      if (labelScale) labelScale.textContent = `${perc}%`;
    }
    if (offX !== null && offX !== undefined) {
      const rangeOffsetX = document.getElementById('range-img-offset-x');
      const labelOffsetX = document.getElementById('label-img-offset-x');
      if (rangeOffsetX) rangeOffsetX.value = offX;
      if (labelOffsetX) labelOffsetX.textContent = `${offX}%`;
    }
    if (offY !== null && offY !== undefined) {
      const rangeOffsetY = document.getElementById('range-img-offset-y');
      const labelOffsetY = document.getElementById('label-img-offset-y');
      if (rangeOffsetY) rangeOffsetY.value = offY;
      if (labelOffsetY) labelOffsetY.textContent = `${offY}%`;
    }
  }

  syncQRSliders(posX, posY, size) {
    if (posX !== null && posX !== undefined) {
      const rangePosX = document.getElementById('range-qr-pos-x');
      const labelPosX = document.getElementById('label-qr-pos-x');
      if (rangePosX) rangePosX.value = posX;
      if (labelPosX) labelPosX.textContent = `${posX}%`;
    }
    if (posY !== null && posY !== undefined) {
      const rangePosY = document.getElementById('range-qr-pos-y');
      const labelPosY = document.getElementById('label-qr-pos-y');
      if (rangePosY) rangePosY.value = posY;
      if (labelPosY) labelPosY.textContent = `${posY}%`;
    }
    if (size !== null && size !== undefined) {
      const rangeSize = document.getElementById('range-qr-size');
      const labelSize = document.getElementById('label-qr-size');
      if (rangeSize) rangeSize.value = size;
      if (labelSize) labelSize.textContent = `${size}%`;
    }
    this.updateTransformBox();
  }

  bindDimensionsControls() {
    const widthInput = document.getElementById('input-dim-width');
    const heightInput = document.getElementById('input-dim-height');
    const btnReset = document.getElementById('btn-reset-dimensions');
    const chipText = document.getElementById('spec-chip-text');
    const exportDimLabel = document.getElementById('export-dimension-label');

    const updateDimensions = () => {
      const w = parseFloat(widthInput.value) || DEFAULT_DIMENSIONS.widthMm / 10;
      const h = parseFloat(heightInput.value) || DEFAULT_DIMENSIONS.heightMm / 10;
      const widthMm = Math.round(w * 10);
      const heightMm = Math.round(h * 10);

      stateManager.update('dimension', { widthMm, heightMm });
      const label = `${widthMm} x ${heightMm} mm • Acrílico Cristal 6mm`;
      chipText.textContent = label;
      exportDimLabel.textContent = `${widthMm} x ${heightMm} mm • 300 DPI em escala 1:1`;
    };

    widthInput.addEventListener('change', updateDimensions);
    heightInput.addEventListener('change', updateDimensions);

    btnReset.addEventListener('click', () => {
      widthInput.value = '11';
      heightInput.value = '15';
      updateDimensions();
      showToast('Dimensões restauradas para 11 x 15 cm', 'info');
    });
  }

  bindViewControls() {
    const btn3D = document.getElementById('btn-view-3d');
    const btn2D = document.getElementById('btn-view-2d');
    const view3D = document.getElementById('three-canvas-container');
    const view2D = document.getElementById('print-2d-preview');
    const cameraBtns = document.querySelectorAll('.camera-btn');
    const autoRotateBtn = document.getElementById('btn-toggle-autorotate');
    const resetCameraBtn = document.getElementById('btn-reset-camera');

    // Botões de modo do mouse no 3D: Girar 3D vs Mover na Placa
    const btnModeOrbit = document.getElementById('btn-mode-orbit');
    const btnModeDragSurface = document.getElementById('btn-mode-drag-surface');

    if (btnModeOrbit) {
      btnModeOrbit.addEventListener('click', () => {
        btnModeOrbit.classList.add('active');
        btnModeDragSurface?.classList.remove('active');
        stateManager.emit('view.interactionMode', 'orbit');
        showToast('Modo de rotação 3D ativado', 'info', 2000);
      });
    }

    if (btnModeDragSurface) {
      btnModeDragSurface.addEventListener('click', () => {
        btnModeDragSurface.classList.add('active');
        btnModeOrbit?.classList.remove('active');
        stateManager.emit('view.interactionMode', 'drag');
        showToast('Clique e arraste diretamente na placa 3D para mover o elemento!', 'info', 3000);
      });
    }

    const btnCenter3D = document.getElementById('btn-center-element-3d');
    if (btnCenter3D) {
      btnCenter3D.addEventListener('click', () => {
        this.centerCurrentSelection();
      });
    }

    btn3D.addEventListener('click', () => {
      btn3D.classList.add('active');
      btn2D.classList.remove('active');
      view3D.classList.remove('hidden');
      view2D.classList.add('hidden');
      stateManager.set('view.is3DMode', true);
    });

    btn2D.addEventListener('click', () => {
      btn2D.classList.add('active');
      btn3D.classList.remove('active');
      view2D.classList.remove('hidden');
      view3D.classList.add('hidden');
      stateManager.set('view.is3DMode', false);
    });

    cameraBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        cameraBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const angle = btn.getAttribute('data-angle');
        stateManager.emit('view.cameraPreset', angle);
      });
    });

    autoRotateBtn.addEventListener('click', () => {
      const current = autoRotateBtn.classList.contains('active');
      autoRotateBtn.classList.toggle('active', !current);
      stateManager.emit('view.autoRotate', !current);
    });

    resetCameraBtn.addEventListener('click', () => {
      stateManager.emit('camera:reset');
    });
  }
}
