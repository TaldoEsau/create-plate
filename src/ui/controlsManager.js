import { stateManager } from '../core/state.js';
import { showToast } from './toast.js';
import { DEFAULT_DIMENSIONS } from '../core/constants.js';
import { ICONS_DATA, ICON_CATEGORIES, getIconById } from '../artwork/iconLibrary.js';

export class ControlsManager {
  constructor() {
    this.debounceTimers = new Map();
    this.activeTarget = 'qr1'; // 'qr1' | 'qr2' | layerId | 'bg'
    this.currentDragTarget = 'qr1';
  }

  init() {
    this.bindTabNavigation();
    this.bindStudioTemplates();
    this.bindStudioTools();
    this.bindIconModal();
    this.bindBackgroundControls();
    this.bindDualQRControls();
    this.bindLayerInspectorActions();
    this.bindContextMenu();
    this.bind2DCanvasDragging();
    this.bindTransformBoxHandles();
    this.bindScaleButtons();
    this.bindKeyboardShortcuts();
    this.bindDimensionsControls();
    this.bindViewControls();

    // Listeners de estado para sincronizar UI do Inspector e Camadas
    stateManager.on('change:artwork', () => {
      this.renderLayersList();
      this.updateInspector();
      this.updateTransformBox();
    });

    stateManager.on('change:qrCode', () => {
      this.updateTransformBox();
      if (this.activeTarget === 'qr1') this.updateInspector();
    });

    stateManager.on('change:qrCode2', () => {
      this.updateTransformBox();
      if (this.activeTarget === 'qr2') this.updateInspector();
    });

    // Renderização inicial da UI de camadas e inspector
    this.renderLayersList();
    this.updateInspector();
  }

  debounce(key, fn, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    this.debounceTimers.set(key, setTimeout(fn, delay));
  }

  // --- NAVEGAÇÃO ENTRE ABAS PRINCIPAIS ---
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

        if (targetTabId === 'tab-content-qr') {
          this.setActiveTarget('qr1');
        } else if (targetTabId === 'tab-content-art') {
          const firstLayer = stateManager.get('artwork.layers')?.[0];
          this.setActiveTarget(firstLayer ? firstLayer.id : 'qr1');
        }
      });
    });
  }

  // --- 1. MODELOS PRONTOS RÁPIDOS (1-CLIQUE) ---
  bindStudioTemplates() {
    const templateBtns = document.querySelectorAll('.template-card-btn');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const templateId = btn.getAttribute('data-template-id');
        templateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        stateManager.loadTemplate(templateId);
        this.syncDualQRUIFromState();
        showToast(`Modelo carregado! Edite os elementos e links à vontade.`, 'success');
      });
    });
  }

  // --- 2. FERRAMENTAS DO STUDIO ESTILO PHOTOSHOP ---
  bindStudioTools() {
    const fileMultipleInput = document.getElementById('input-multiple-images');
    const btnAddImage = document.getElementById('btn-add-image');
    const btnAddText = document.getElementById('btn-add-text');
    const btnOpenIcons = document.getElementById('btn-open-icons');
    const btnAddCard = document.getElementById('btn-add-card');
    const btnToggleBg = document.getElementById('btn-toggle-bg-settings');
    const bgDrawer = document.getElementById('bg-settings-drawer');

    // Adicionar Múltiplas Imagens (Upload de logos, fotos, selos)
    if (btnAddImage && fileMultipleInput) {
      btnAddImage.addEventListener('click', () => fileMultipleInput.click());
      fileMultipleInput.addEventListener('change', () => {
        if (fileMultipleInput.files && fileMultipleInput.files.length > 0) {
          Array.from(fileMultipleInput.files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              const newLayer = stateManager.addLayer({
                type: 'image',
                name: file.name.replace(/\.[^/.]+$/, ""),
                url: e.target.result,
                x: 50 + (index * 4),
                y: 35 + (index * 4),
                sizePercent: 28,
                opacity: 1.0,
                borderRadius: 0
              });
              this.setActiveTarget(newLayer.id);
            };
            reader.readAsDataURL(file);
          });
          showToast(`${fileMultipleInput.files.length} imagem(ns) adicionada(s) à placa!`, 'success');
          fileMultipleInput.value = '';
        }
      });
    }

    // Adicionar Caixa de Texto
    if (btnAddText) {
      btnAddText.addEventListener('click', () => {
        const newLayer = stateManager.addLayer({
          type: 'text',
          name: 'Novo Texto',
          text: 'Seu Texto Aqui',
          fontFamily: 'Outfit',
          fontSize: 22,
          fontWeight: '700',
          color: '#0f172a',
          align: 'center',
          x: 50,
          y: 40
        });
        this.setActiveTarget(newLayer.id);
        showToast('Texto adicionado! Edite no painel ou arraste no 2D.', 'info');
      });
    }

    // Adicionar Ícone (Abre Modal)
    if (btnOpenIcons) {
      btnOpenIcons.addEventListener('click', () => {
        this.openIconModal();
      });
    }

    // Adicionar Cartão / Base
    if (btnAddCard) {
      btnAddCard.addEventListener('click', () => {
        const newLayer = stateManager.addLayer({
          type: 'shape',
          shapeType: 'card',
          name: 'Cartão de Fundo',
          x: 50,
          y: 50,
          widthPercent: 44,
          heightPercent: 32,
          color: '#f8fafc',
          borderColor: '#e2e8f0',
          borderWidth: 1.5,
          borderRadius: 16
        });
        this.setActiveTarget(newLayer.id);
        showToast('Cartão decorativo adicionado!', 'info');
      });
    }

    // Alternar Gaveta de Fundo
    if (btnToggleBg && bgDrawer) {
      btnToggleBg.addEventListener('click', () => {
        bgDrawer.classList.toggle('hidden');
      });
    }
  }

  // --- 3. BIBLIOTECA DE ÍCONES VETORIAIS (MODAL & BUSCA) ---
  bindIconModal() {
    const modal = document.getElementById('modal-icon-library');
    const btnClose = document.getElementById('btn-close-icons-modal');
    const inputSearch = document.getElementById('input-search-icons');
    const categoryTabs = document.getElementById('icon-category-tabs');
    const iconsGrid = document.getElementById('icons-picker-grid');

    if (!modal) return;

    let selectedCategory = 'all';
    let searchQuery = '';

    const renderCategories = () => {
      categoryTabs.innerHTML = '';
      ICON_CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `category-chip-btn ${cat.id === selectedCategory ? 'active' : ''}`;
        btn.textContent = cat.label;
        btn.addEventListener('click', () => {
          selectedCategory = cat.id;
          renderCategories();
          renderIcons();
        });
        categoryTabs.appendChild(btn);
      });
    };

    const renderIcons = () => {
      iconsGrid.innerHTML = '';
      const filtered = ICONS_DATA.filter(icon => {
        const matchCategory = selectedCategory === 'all' || icon.category === selectedCategory;
        const matchSearch = !searchQuery || icon.name.toLowerCase().includes(searchQuery) || icon.id.includes(searchQuery);
        return matchCategory && matchSearch;
      });

      if (filtered.length === 0) {
        iconsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-secondary); font-size: 0.88rem;">Nenhum ícone encontrado com este termo.</div>';
        return;
      }

      filtered.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'icon-picker-card';
        card.title = `Adicionar ${icon.name}`;
        card.innerHTML = `
          <div class="icon-svg-preview">${icon.svg}</div>
          <span class="icon-label-name">${icon.name}</span>
        `;
        card.addEventListener('click', () => {
          // Adiciona ícone na placa como camada
          let defaultColor = '#0f172a';
          if (icon.id === 'instagram') defaultColor = '#E1306C';
          else if (icon.id === 'whatsapp') defaultColor = '#25D366';
          else if (icon.id === 'google') defaultColor = '#4285F4';
          else if (icon.id === 'pix') defaultColor = '#00BDAE';
          else if (icon.id === 'wifi') defaultColor = '#0284c7';
          else if (icon.id === 'star-filled') defaultColor = '#FBBC05';

          const newLayer = stateManager.addLayer({
            type: 'icon',
            name: `Ícone ${icon.name}`,
            iconName: icon.id,
            sizePercent: 10,
            color: defaultColor,
            x: 50,
            y: 35
          });

          this.setActiveTarget(newLayer.id);
          this.closeIconModal();
          showToast(`Ícone "${icon.name}" adicionado à placa!`, 'success');
        });
        iconsGrid.appendChild(card);
      });
    };

    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderIcons();
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeIconModal());
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeIconModal();
    });

    this.openIconModal = () => {
      modal.classList.remove('hidden');
      searchQuery = '';
      if (inputSearch) inputSearch.value = '';
      renderCategories();
      renderIcons();
      inputSearch?.focus();
    };

    this.closeIconModal = () => {
      modal.classList.add('hidden');
    };
  }

  // --- 4. CONFIGURAÇÕES DE FUNDO DA PLACA ---
  bindBackgroundControls() {
    const inputBgColor = document.getElementById('input-bg-color');
    const presetBgDots = document.querySelectorAll('#preset-bg-dots .preset-dot');
    const gradBtns = document.querySelectorAll('.btn-grad-preset');
    const btnSelectBgImg = document.getElementById('btn-select-bg-img');
    const inputBgImgFile = document.getElementById('input-bg-image-file');
    const btnRemoveBgImg = document.getElementById('btn-remove-bg-img');

    if (inputBgColor) {
      inputBgColor.addEventListener('input', (e) => {
        stateManager.update('artwork', {
          backgroundColor: e.target.value,
          backgroundGradient: null
        });
      });
    }

    presetBgDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const bg = dot.getAttribute('data-bg');
        if (inputBgColor) inputBgColor.value = bg;
        presetBgDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        stateManager.update('artwork', {
          backgroundColor: bg,
          backgroundGradient: null
        });
      });
    });

    gradBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const gradType = btn.getAttribute('data-grad');
        let grad = null;
        if (gradType === 'insta') {
          grad = { type: 'linear', colors: ['#833ab4', '#fcb045'] };
        } else if (gradType === 'neon') {
          grad = { type: 'linear', colors: ['#4f46e5', '#06b6d4'] };
        } else if (gradType === 'dark') {
          grad = { type: 'linear', colors: ['#0f172a', '#334155'] };
        } else if (gradType === 'gold') {
          grad = { type: 'linear', colors: ['#f59e0b', '#d97706'] };
        }

        stateManager.update('artwork', { backgroundGradient: grad });
        showToast('Degradê de fundo aplicado!', 'info');
      });
    });

    if (btnSelectBgImg && inputBgImgFile) {
      btnSelectBgImg.addEventListener('click', () => inputBgImgFile.click());
      inputBgImgFile.addEventListener('change', () => {
        if (inputBgImgFile.files.length > 0) {
          const file = inputBgImgFile.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            stateManager.update('artwork', {
              backgroundImageUrl: e.target.result,
              bgFitMode: 'cover'
            });
            btnRemoveBgImg?.classList.remove('hidden');
            showToast('Imagem de fundo aplicada!', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnRemoveBgImg) {
      btnRemoveBgImg.addEventListener('click', () => {
        stateManager.update('artwork', { backgroundImageUrl: null });
        btnRemoveBgImg.classList.add('hidden');
        showToast('Imagem de fundo removida.', 'info');
      });
    }
  }

  // --- 5. CONTROLES DE ATÉ 2 QR CODES ---
  bindDualQRControls() {
    const pillQR1 = document.getElementById('pill-select-qr1');
    const pillQR2 = document.getElementById('pill-select-qr2');
    const sectionQR1 = document.getElementById('section-qr1-controls');
    const sectionQR2 = document.getElementById('section-qr2-controls');
    const toggleEnableQR2 = document.getElementById('toggle-enable-qr2');
    const dualPresetsWrap = document.getElementById('dual-qr-presets-wrap');
    const qr2Badge = document.getElementById('qr2-active-badge');

    // Alternar visualização dos controles entre QR 1 e QR 2
    pillQR1?.addEventListener('click', () => {
      pillQR1.classList.add('active');
      pillQR2.classList.remove('active');
      sectionQR1.classList.remove('hidden');
      sectionQR2.classList.add('hidden');
      this.setActiveTarget('qr1');
    });

    pillQR2?.addEventListener('click', () => {
      pillQR2.classList.add('active');
      pillQR1.classList.remove('active');
      sectionQR2.classList.remove('hidden');
      sectionQR1.classList.add('hidden');
      this.setActiveTarget('qr2');
    });

    // Ativar / Desativar QR Code 2
    if (toggleEnableQR2) {
      toggleEnableQR2.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        stateManager.set('qrCode2.enabled', isEnabled);
        if (isEnabled) {
          dualPresetsWrap?.classList.remove('hidden');
          qr2Badge?.classList.remove('hidden');
          // Aplica layout padrão lado a lado
          this.applyDualQRLayout('side');
          showToast('2º QR Code ativado! Ajuste o link e posicione na placa.', 'success');
        } else {
          dualPresetsWrap?.classList.add('hidden');
          qr2Badge?.classList.add('hidden');
          // Retorna QR 1 ao centro
          stateManager.update('qrCode', { posX: 50, sizePercent: 44 });
          showToast('2º QR Code desativado.', 'info');
        }
      });
    }

    // Presets de Layout para 2 QR Codes
    const btnDualSide = document.getElementById('btn-dual-pos-side');
    const btnDualCenter = document.getElementById('btn-dual-pos-center');
    const btnDualStacked = document.getElementById('btn-dual-pos-stacked');

    btnDualSide?.addEventListener('click', () => this.applyDualQRLayout('side'));
    btnDualCenter?.addEventListener('click', () => this.applyDualQRLayout('center'));
    btnDualStacked?.addEventListener('click', () => this.applyDualQRLayout('stacked'));

    // Configurações do QR 1
    this.bindSingleQRSection(1);

    // Configurações do QR 2
    this.bindSingleQRSection(2);
  }

  applyDualQRLayout(preset) {
    const dualBtns = document.querySelectorAll('.btn-dual-preset');
    dualBtns.forEach(b => b.classList.remove('active'));

    if (preset === 'side') {
      document.getElementById('btn-dual-pos-side')?.classList.add('active');
      stateManager.update('qrCode', { posX: 28, posY: 62, sizePercent: 32 });
      stateManager.update('qrCode2', { posX: 72, posY: 62, sizePercent: 32 });
    } else if (preset === 'center') {
      document.getElementById('btn-dual-pos-center')?.classList.add('active');
      stateManager.update('qrCode', { posX: 28, posY: 50, sizePercent: 33 });
      stateManager.update('qrCode2', { posX: 72, posY: 50, sizePercent: 33 });
    } else if (preset === 'stacked') {
      document.getElementById('btn-dual-pos-stacked')?.classList.add('active');
      stateManager.update('qrCode', { posX: 50, posY: 36, sizePercent: 30 });
      stateManager.update('qrCode2', { posX: 50, posY: 70, sizePercent: 30 });
    }
  }

  bindSingleQRSection(num) {
    const suffix = num === 1 ? '' : '2';
    const stateKey = num === 1 ? 'qrCode' : 'qrCode2';

    const urlInput = document.getElementById(`input-qr${suffix}-url`);
    const labelInput = document.getElementById(`input-qr${suffix}-label`);
    const colorPicker = document.getElementById(`input-qr${suffix}-color`);
    const rangeSize = document.getElementById(`range-qr${suffix}-size`);
    const labelSize = document.getElementById(`label-qr${suffix}-size`);
    const rangePosX = document.getElementById(`range-qr${suffix}-pos-x`);
    const labelPosX = document.getElementById(`label-qr${suffix}-pos-x`);
    const rangePosY = document.getElementById(`range-qr${suffix}-pos-y`);
    const labelPosY = document.getElementById(`label-qr${suffix}-pos-y`);

    // Presets rápidos de Tipo (Google, Instagram, WhatsApp, PIX, etc.)
    const typeChips = document.querySelectorAll(`.btn-qr-type-chip[data-target-qr="${num}"]`);
    typeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        typeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const type = chip.getAttribute('data-type');

        if (type === 'google') {
          if (urlInput) urlInput.value = 'https://google.com';
          if (labelInput) labelInput.value = 'Avalie no Google';
          stateManager.update(stateKey, { url: 'https://google.com', label: 'Avalie no Google', logoChoice: 'google', fgColor: '#000000' });
        } else if (type === 'instagram') {
          if (urlInput) urlInput.value = 'https://instagram.com/sua.empresa';
          if (labelInput) labelInput.value = 'Siga no Instagram';
          stateManager.update(stateKey, { url: 'https://instagram.com', label: 'Siga no Instagram', logoChoice: 'instagram', fgColor: '#000000' });
        } else if (type === 'whatsapp') {
          if (urlInput) urlInput.value = 'https://wa.me/5500000000000';
          if (labelInput) labelInput.value = 'Chame no WhatsApp';
          stateManager.update(stateKey, { url: 'https://wa.me/5500000000000', label: 'Chame no WhatsApp', logoChoice: 'whatsapp', fgColor: '#000000' });
        } else if (type === 'pix') {
          if (urlInput) urlInput.value = 'https://pix.bcb.gov.br';
          if (labelInput) labelInput.value = 'Pague com PIX';
          stateManager.update(stateKey, { url: 'https://pix.bcb.gov.br', label: 'Pague com PIX', logoChoice: 'pix', fgColor: '#000000' });
        } else if (type === 'wifi') {
          if (urlInput) urlInput.value = 'WIFI:T:WPA;S:NomeDaRede;P:Senha123;;';
          if (labelInput) labelInput.value = 'Conecte ao Wi-Fi';
          stateManager.update(stateKey, { url: 'WIFI:T:WPA;S:NomeDaRede;P:Senha123;;', label: 'Conecte ao Wi-Fi', logoChoice: 'wifi', fgColor: '#000000' });
        } else if (type === 'site') {
          if (urlInput) urlInput.value = 'https://seusite.com.br';
          if (labelInput) labelInput.value = 'Acesse nosso Site';
          stateManager.update(stateKey, { url: 'https://seusite.com.br', label: 'Acesse nosso Site', logoChoice: 'globe', fgColor: '#000000' });
        }
      });
    });

    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        this.debounce(`qr${num}_url`, () => stateManager.set(`${stateKey}.url`, e.target.value));
      });
    }

    if (labelInput) {
      labelInput.addEventListener('input', (e) => {
        this.debounce(`qr${num}_label`, () => stateManager.set(`${stateKey}.label`, e.target.value));
      });
    }

    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        stateManager.set(`${stateKey}.fgColor`, e.target.value);
      });
    }

    if (rangeSize) {
      rangeSize.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelSize) labelSize.textContent = `${val}%`;
        stateManager.set(`${stateKey}.sizePercent`, val);
      });
    }

    if (rangePosX) {
      rangePosX.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelPosX) labelPosX.textContent = `${val}%`;
        stateManager.set(`${stateKey}.posX`, val);
      });
    }

    if (rangePosY) {
      rangePosY.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (labelPosY) labelPosY.textContent = `${val}%`;
        stateManager.set(`${stateKey}.posY`, val);
      });
    }

    // Logo Radio Pills
    const radioName = num === 1 ? 'qr_logo_choice' : 'qr2_logo_choice';
    const logoRadios = document.querySelectorAll(`input[name="${radioName}"]`);
    logoRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        const choice = radio.value;
        stateManager.set(`${stateKey}.logoChoice`, choice);
        radio.closest('.logo-selector-grid')?.querySelectorAll('.logo-pill-card').forEach(p => p.classList.remove('active'));
        radio.closest('.logo-pill-card')?.classList.add('active');

        const customWrap = document.getElementById('custom-logo-upload-wrap');
        if (num === 1 && customWrap) {
          if (choice === 'custom') customWrap.classList.remove('hidden');
          else customWrap.classList.add('hidden');
        }
      });
    });

    // Custom Logo File (QR 1)
    if (num === 1) {
      const customLogoDrop = document.getElementById('logo-mini-dropzone');
      const customLogoInput = document.getElementById('input-custom-logo-file');
      const customLogoText = document.getElementById('logo-mini-text');
      if (customLogoDrop && customLogoInput) {
        customLogoDrop.addEventListener('click', () => customLogoInput.click());
        customLogoInput.addEventListener('change', () => {
          if (customLogoInput.files.length > 0) {
            const file = customLogoInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
              stateManager.set('qrCode.customLogoUrl', e.target.result);
              if (customLogoText) customLogoText.textContent = `Logo: ${file.name}`;
              showToast('Logotipo central atualizado!', 'success');
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  }

  syncDualQRUIFromState() {
    const qr2 = stateManager.get('qrCode2');
    const toggleQR2 = document.getElementById('toggle-enable-qr2');
    const dualPresetsWrap = document.getElementById('dual-qr-presets-wrap');
    const qr2Badge = document.getElementById('qr2-active-badge');

    if (toggleQR2) {
      toggleQR2.checked = !!(qr2 && qr2.enabled);
      if (qr2 && qr2.enabled) {
        dualPresetsWrap?.classList.remove('hidden');
        qr2Badge?.classList.remove('hidden');
      } else {
        dualPresetsWrap?.classList.add('hidden');
        qr2Badge?.classList.add('hidden');
      }
    }
  }

  // --- 6. PAINEL INSPECTOR DO ELEMENTO SELECIONADO ---
  bindLayerInspectorActions() {
    const btnFront = document.getElementById('btn-layer-front');
    const btnUp = document.getElementById('btn-layer-up');
    const btnDown = document.getElementById('btn-layer-down');
    const btnBack = document.getElementById('btn-layer-back');
    const btnDup = document.getElementById('btn-layer-dup');
    const btnDel = document.getElementById('btn-layer-del');

    btnFront?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.bringLayerToFront(this.activeTarget);
        showToast('Elemento trazido para a frente (por cima de todos)!', 'success');
      }
    });

    btnUp?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.reorderLayer(this.activeTarget, 'up');
      }
    });

    btnDown?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.reorderLayer(this.activeTarget, 'down');
      }
    });

    btnBack?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.sendLayerToBack(this.activeTarget);
        showToast('Elemento enviado para trás (por baixo de todos)!', 'info');
      }
    });

    btnDup?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        const dup = stateManager.duplicateLayer(this.activeTarget);
        if (dup) this.setActiveTarget(dup.id);
        showToast('Elemento duplicado!', 'info');
      }
    });

    btnDel?.addEventListener('click', () => {
      this.deleteActiveElement();
    });
  }

  // --- MENU DE CONTEXTO COM BOTÃO DIREITO DO MOUSE ---
  bindContextMenu() {
    const ctxMenu = document.getElementById('custom-context-menu');
    const previewCanvas2D = document.getElementById('preview-2d-canvas');
    const container3D = document.getElementById('three-canvas-container');
    const ctxTitle = document.getElementById('ctx-header-title');

    const btnFront = document.getElementById('ctx-bring-front');
    const btnUp = document.getElementById('ctx-move-up');
    const btnDown = document.getElementById('ctx-move-down');
    const btnBack = document.getElementById('ctx-send-back');
    const btnCenter = document.getElementById('ctx-center');
    const btnDup = document.getElementById('ctx-duplicate');
    const btnDel = document.getElementById('ctx-delete');

    if (!ctxMenu) return;

    const openContextMenu = (e, targetId = null) => {
      e.preventDefault();
      e.stopPropagation();

      if (targetId) {
        this.setActiveTarget(targetId);
      }

      if (!this.activeTarget) return;

      if (ctxTitle) {
        if (this.activeTarget === 'qr1') ctxTitle.textContent = '📱 QR Code 1';
        else if (this.activeTarget === 'qr2') ctxTitle.textContent = '📱 QR Code 2';
        else {
          const l = (stateManager.get('artwork.layers') || []).find(layer => layer.id === this.activeTarget);
          ctxTitle.textContent = l ? `${l.name || l.text || 'Camada'}` : 'Elemento';
        }
      }

      ctxMenu.classList.remove('hidden');

      const menuWidth = 230;
      const menuHeight = 280;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 12;
      if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 12;

      ctxMenu.style.left = `${Math.max(8, x)}px`;
      ctxMenu.style.top = `${Math.max(8, y)}px`;
    };

    const closeContextMenu = () => {
      ctxMenu.classList.add('hidden');
    };

    // Botão direito no 2D Canvas e em toda a área interativa da placa
    const previewWrapper2D = document.getElementById('preview-canvas-wrapper');
    if (previewWrapper2D) {
      previewWrapper2D.addEventListener('contextmenu', (e) => {
        if (!previewCanvas2D) return;
        const rect = previewCanvas2D.getBoundingClientRect();
        const clickRelX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickRelY = ((e.clientY - rect.top) / rect.height) * 100;
        const hit = this.getElementAtPoint(clickRelX, clickRelY);
        openContextMenu(e, hit || this.activeTarget);
      });
    } else if (previewCanvas2D) {
      previewCanvas2D.addEventListener('contextmenu', (e) => {
        const rect = previewCanvas2D.getBoundingClientRect();
        const clickRelX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickRelY = ((e.clientY - rect.top) / rect.height) * 100;
        const hit = this.getElementAtPoint(clickRelX, clickRelY);
        openContextMenu(e, hit || this.activeTarget);
      });
    }

    // Botão direito no 3D Canvas
    if (container3D) {
      container3D.addEventListener('contextmenu', (e) => {
        openContextMenu(e, this.activeTarget);
      });
    }

    // Ações dos itens do menu
    btnFront?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.bringLayerToFront(this.activeTarget);
        showToast('Elemento trazido para a frente (por cima de todos)!', 'success');
      }
      closeContextMenu();
    });

    btnUp?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.reorderLayer(this.activeTarget, 'up');
        showToast('Camada subiu um nível.', 'info');
      }
      closeContextMenu();
    });

    btnDown?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.reorderLayer(this.activeTarget, 'down');
        showToast('Camada desceu um nível.', 'info');
      }
      closeContextMenu();
    });

    btnBack?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.sendLayerToBack(this.activeTarget);
        showToast('Elemento enviado para trás (por baixo de todos)!', 'info');
      }
      closeContextMenu();
    });

    btnCenter?.addEventListener('click', () => {
      this.centerCurrentSelection();
      closeContextMenu();
    });

    btnDup?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        const dup = stateManager.duplicateLayer(this.activeTarget);
        if (dup) this.setActiveTarget(dup.id);
        showToast('Elemento duplicado!', 'info');
      }
      closeContextMenu();
    });

    btnDel?.addEventListener('click', () => {
      this.deleteActiveElement();
      closeContextMenu();
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('#custom-context-menu')) {
        closeContextMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeContextMenu();
    });
  }

  deleteActiveElement() {
    if (!this.activeTarget) return;

    if (this.activeTarget === 'qr1') {
      showToast('O QR Code 1 é o código principal da placa.', 'warning');
    } else if (this.activeTarget === 'qr2') {
      stateManager.set('qrCode2.enabled', false);
      this.syncDualQRUIFromState();
      this.setActiveTarget('qr1');
      showToast('2º QR Code desativado.', 'info');
    } else {
      stateManager.removeLayer(this.activeTarget);
      this.setActiveTarget('qr1');
      showToast('Elemento removido da placa.', 'info');
    }
  }

  setActiveTarget(targetId) {
    this.activeTarget = targetId;
    this.currentDragTarget = targetId;
    this.updateInspector();
    this.updateTransformBox();
    this.renderLayersList();

    const btnDragImg = document.getElementById('btn-2d-drag-img');
    const btnDragQr = document.getElementById('btn-2d-drag-qr');
    if (btnDragImg && btnDragQr) {
      if (targetId && (targetId === 'qr1' || targetId === 'qr2')) {
        btnDragQr.classList.add('active');
        btnDragImg.classList.remove('active');
      } else {
        btnDragImg.classList.add('active');
        btnDragQr.classList.remove('active');
      }
    }
  }

  updateInspector() {
    const container = document.getElementById('inspector-fields-container');
    const badgeIcon = document.getElementById('inspector-badge-icon');
    const badgeTitle = document.getElementById('inspector-badge-title');
    if (!container) return;

    if (!this.activeTarget) {
      container.innerHTML = '<p class="inspector-empty-hint">Clique em qualquer elemento na placa para editar suas propriedades ao vivo.</p>';
      if (badgeTitle) badgeTitle.textContent = 'Nenhum Selecionado';
      return;
    }

    if (this.activeTarget === 'qr1') {
      const qr = stateManager.get('qrCode') || {};
      if (badgeIcon) badgeIcon.textContent = '📱';
      if (badgeTitle) badgeTitle.textContent = 'QR Code 1 (Principal)';
      container.innerHTML = `
        <div class="input-group">
          <label>Link / URL</label>
          <input type="text" id="insp-qr-url" value="${qr.url || ''}">
        </div>
        <div class="input-group">
          <label>Rótulo Abaixo do QR</label>
          <input type="text" id="insp-qr-label" value="${qr.label || ''}">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Tamanho do QR Code</label>
            <span class="slider-val-badge">${qr.sizePercent || 42}%</span>
          </div>
          <input type="range" id="insp-qr-size" min="15" max="85" value="${qr.sizePercent || 42}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-qr-url')?.addEventListener('input', (e) => {
        this.debounce('insp_qr_url', () => stateManager.set('qrCode.url', e.target.value));
      });
      container.querySelector('#insp-qr-label')?.addEventListener('input', (e) => {
        this.debounce('insp_qr_label', () => stateManager.set('qrCode.label', e.target.value));
      });
      container.querySelector('#insp-qr-size')?.addEventListener('input', (e) => {
        stateManager.set('qrCode.sizePercent', Number(e.target.value));
      });
      return;
    }

    if (this.activeTarget === 'qr2') {
      const qr2 = stateManager.get('qrCode2') || {};
      if (badgeIcon) badgeIcon.textContent = '📱';
      if (badgeTitle) badgeTitle.textContent = 'QR Code 2';
      container.innerHTML = `
        <div class="input-group">
          <label>Link / URL do 2º QR</label>
          <input type="text" id="insp-qr2-url" value="${qr2.url || ''}">
        </div>
        <div class="input-group">
          <label>Rótulo Abaixo do 2º QR</label>
          <input type="text" id="insp-qr2-label" value="${qr2.label || ''}">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Tamanho do QR 2</label>
            <span class="slider-val-badge">${qr2.sizePercent || 32}%</span>
          </div>
          <input type="range" id="insp-qr2-size" min="15" max="85" value="${qr2.sizePercent || 32}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-qr2-url')?.addEventListener('input', (e) => {
        this.debounce('insp_qr2_url', () => stateManager.set('qrCode2.url', e.target.value));
      });
      container.querySelector('#insp-qr2-label')?.addEventListener('input', (e) => {
        this.debounce('insp_qr2_label', () => stateManager.set('qrCode2.label', e.target.value));
      });
      container.querySelector('#insp-qr2-size')?.addEventListener('input', (e) => {
        stateManager.set('qrCode2.sizePercent', Number(e.target.value));
      });
      return;
    }

    // Camadas (Texto, Ícone, Imagem, Forma)
    const layers = stateManager.get('artwork.layers') || [];
    const layer = layers.find(l => l.id === this.activeTarget);

    if (!layer) {
      container.innerHTML = '<p class="inspector-empty-hint">Elemento não encontrado.</p>';
      return;
    }

    if (layer.type === 'text') {
      if (badgeIcon) badgeIcon.textContent = '🔤';
      if (badgeTitle) badgeTitle.textContent = `Texto: "${layer.text?.substring(0, 16) || ''}..."`;
      container.innerHTML = `
        <div class="input-group">
          <label>Conteúdo do Texto</label>
          <input type="text" id="insp-text-val" value="${layer.text || ''}">
        </div>
        <div class="input-group">
          <label>Tipografia / Fonte</label>
          <select id="insp-text-font" class="styled-select">
            <option value="Outfit" ${layer.fontFamily === 'Outfit' ? 'selected' : ''}>Outfit (Moderna & Arrojada)</option>
            <option value="Inter" ${layer.fontFamily === 'Inter' ? 'selected' : ''}>Inter (Clean & Minimalista)</option>
            <option value="Montserrat" ${layer.fontFamily === 'Montserrat' ? 'selected' : ''}>Montserrat (Geométrica)</option>
            <option value="Playfair Display" ${layer.fontFamily === 'Playfair Display' ? 'selected' : ''}>Playfair (Luxo & Elegante)</option>
            <option value="Poppins" ${layer.fontFamily === 'Poppins' ? 'selected' : ''}>Poppins (Suave & Amigável)</option>
          </select>
        </div>
        <div class="input-group">
          <label>Cor do Texto</label>
          <div class="color-selection-row">
            <input type="color" id="insp-text-color" value="${layer.color || '#000000'}" class="styled-color-picker">
            <select id="insp-text-weight" class="styled-select" style="flex: 1;">
              <option value="400" ${layer.fontWeight === '400' ? 'selected' : ''}>Normal</option>
              <option value="600" ${layer.fontWeight === '600' ? 'selected' : ''}>Semibold</option>
              <option value="700" ${layer.fontWeight === '700' ? 'selected' : ''}>Negrito</option>
              <option value="800" ${layer.fontWeight === '800' ? 'selected' : ''}>Extra Negrito</option>
            </select>
          </div>
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Tamanho da Fonte</label>
            <span class="slider-val-badge">${layer.fontSize || 20}pt</span>
          </div>
          <input type="range" id="insp-text-size" min="10" max="64" value="${layer.fontSize || 20}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-text-val')?.addEventListener('input', (e) => {
        this.debounce(`insp_txt_${layer.id}`, () => stateManager.updateLayer(layer.id, { text: e.target.value }));
      });
      container.querySelector('#insp-text-font')?.addEventListener('change', (e) => {
        stateManager.updateLayer(layer.id, { fontFamily: e.target.value });
      });
      container.querySelector('#insp-text-color')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { color: e.target.value });
      });
      container.querySelector('#insp-text-weight')?.addEventListener('change', (e) => {
        stateManager.updateLayer(layer.id, { fontWeight: e.target.value });
      });
      container.querySelector('#insp-text-size')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { fontSize: Number(e.target.value) });
      });

    } else if (layer.type === 'icon') {
      if (badgeIcon) badgeIcon.textContent = '🎨';
      if (badgeTitle) badgeTitle.textContent = `Ícone: ${layer.name || 'Ícone'}`;
      container.innerHTML = `
        <div class="input-group">
          <label>Cor do Ícone</label>
          <input type="color" id="insp-icon-color" value="${layer.color || '#000000'}" class="styled-color-picker" style="width: 100%;">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Tamanho do Ícone</label>
            <span class="slider-val-badge">${layer.sizePercent || 10}%</span>
          </div>
          <input type="range" id="insp-icon-size" min="4" max="40" value="${layer.sizePercent || 10}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-icon-color')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { color: e.target.value });
      });
      container.querySelector('#insp-icon-size')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { sizePercent: Number(e.target.value) });
      });

    } else if (layer.type === 'image') {
      if (badgeIcon) badgeIcon.textContent = '🖼️';
      if (badgeTitle) badgeTitle.textContent = `Imagem: ${layer.name || 'Imagem'}`;
      container.innerHTML = `
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Tamanho da Imagem</label>
            <span class="slider-val-badge">${layer.sizePercent || 30}%</span>
          </div>
          <input type="range" id="insp-img-size" min="8" max="100" value="${layer.sizePercent || 30}" class="styled-range">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Opacidade</label>
            <span class="slider-val-badge">${Math.round((layer.opacity !== undefined ? layer.opacity : 1.0) * 100)}%</span>
          </div>
          <input type="range" id="insp-img-opac" min="10" max="100" value="${Math.round((layer.opacity !== undefined ? layer.opacity : 1.0) * 100)}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-img-size')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { sizePercent: Number(e.target.value) });
      });
      container.querySelector('#insp-img-opac')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { opacity: Number(e.target.value) / 100 });
      });

    } else if (layer.type === 'shape') {
      if (badgeIcon) badgeIcon.textContent = '⬛';
      if (badgeTitle) badgeTitle.textContent = `Cartão / Forma`;
      container.innerHTML = `
        <div class="input-group">
          <label>Cor do Cartão</label>
          <input type="color" id="insp-shape-color" value="${layer.color || '#f8fafc'}" class="styled-color-picker" style="width: 100%;">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Largura (%)</label>
            <span class="slider-val-badge">${layer.widthPercent || 40}%</span>
          </div>
          <input type="range" id="insp-shape-w" min="10" max="95" value="${layer.widthPercent || 40}" class="styled-range">
        </div>
        <div class="slider-row">
          <div class="slider-header-flex">
            <label>Altura (%)</label>
            <span class="slider-val-badge">${layer.heightPercent || 25}%</span>
          </div>
          <input type="range" id="insp-shape-h" min="5" max="90" value="${layer.heightPercent || 25}" class="styled-range">
        </div>
      `;

      container.querySelector('#insp-shape-color')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { color: e.target.value });
      });
      container.querySelector('#insp-shape-w')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { widthPercent: Number(e.target.value) });
      });
      container.querySelector('#insp-shape-h')?.addEventListener('input', (e) => {
        stateManager.updateLayer(layer.id, { heightPercent: Number(e.target.value) });
      });
    }
  }

  // --- 7. PILHA DE CAMADAS (LAYERS LIST) ---
  renderLayersList() {
    const listWrap = document.getElementById('layers-list-wrap');
    if (!listWrap) return;

    listWrap.innerHTML = '';
    const layers = stateManager.get('artwork.layers') || [];

    // Adiciona QR Codes na lista de camadas para seleção rápida
    const qr1Row = document.createElement('div');
    qr1Row.className = `layer-item-row ${this.activeTarget === 'qr1' ? 'selected' : ''}`;
    qr1Row.innerHTML = `
      <div class="layer-item-main">
        <span class="layer-item-icon">📱</span>
        <span class="layer-item-title">QR Code 1 (Principal)</span>
      </div>
    `;
    qr1Row.addEventListener('click', () => this.setActiveTarget('qr1'));
    listWrap.appendChild(qr1Row);

    const qr2 = stateManager.get('qrCode2');
    if (qr2 && qr2.enabled) {
      const qr2Row = document.createElement('div');
      qr2Row.className = `layer-item-row ${this.activeTarget === 'qr2' ? 'selected' : ''}`;
      qr2Row.innerHTML = `
        <div class="layer-item-main">
          <span class="layer-item-icon">📱</span>
          <span class="layer-item-title">QR Code 2</span>
        </div>
      `;
      qr2Row.addEventListener('click', () => this.setActiveTarget('qr2'));
      listWrap.appendChild(qr2Row);
    }

    // Renderiza camadas de cima para baixo
    [...layers].reverse().forEach(layer => {
      let icon = '✏️';
      if (layer.type === 'text') icon = '🔤';
      else if (layer.type === 'icon') icon = '🎨';
      else if (layer.type === 'image') icon = '🖼️';
      else if (layer.type === 'shape') icon = '⬛';

      const row = document.createElement('div');
      row.className = `layer-item-row ${this.activeTarget === layer.id ? 'selected' : ''}`;
      row.innerHTML = `
        <div class="layer-item-main">
          <span class="layer-item-icon">${icon}</span>
          <span class="layer-item-title">${layer.name || layer.text || 'Camada'}</span>
        </div>
        <div class="layer-item-tools">
          <button type="button" class="btn-layer-action btn-layer-vis" title="Ocultar/Exibir">
            ${layer.visible !== false ? '👁️' : '🚫'}
          </button>
          <button type="button" class="btn-layer-action btn-layer-remove" title="Excluir">🗑️</button>
        </div>
      `;

      row.querySelector('.layer-item-main').addEventListener('click', () => {
        this.setActiveTarget(layer.id);
      });

      row.querySelector('.btn-layer-vis')?.addEventListener('click', (e) => {
        e.stopPropagation();
        stateManager.updateLayer(layer.id, { visible: layer.visible === false ? true : false });
      });

      row.querySelector('.btn-layer-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        stateManager.removeLayer(layer.id);
        this.setActiveTarget('qr1');
      });

      listWrap.appendChild(row);
    });
  }

  // --- 8. HIT DETECTION E SELEÇÃO DIRETA NO CANVAS 2D ---
  getElementAtPoint(relX, relY) {
    const state = stateManager.get();
    const { widthMm, heightMm } = state.dimension;
    const aspect = widthMm / heightMm;

    // 1. Testa QR Code 2 (se ativo)
    if (state.qrCode2 && state.qrCode2.enabled) {
      const q2 = state.qrCode2;
      const size = q2.sizePercent || 32;
      const halfW = (size * 1.15) / 2;
      const halfH = (size * aspect * 1.15) / 2;
      if (Math.abs(relX - q2.posX) <= halfW && Math.abs(relY - q2.posY) <= halfH) {
        return 'qr2';
      }
    }

    // 2. Testa QR Code 1 (se ativo)
    if (state.qrCode && state.qrCode.enabled !== false) {
      const q1 = state.qrCode;
      const size = q1.sizePercent || 42;
      const halfW = (size * 1.15) / 2;
      const halfH = (size * aspect * 1.15) / 2;
      if (Math.abs(relX - q1.posX) <= halfW && Math.abs(relY - q1.posY) <= halfH) {
        return 'qr1';
      }
    }

    // 3. Testa camadas do topo para a base
    const layers = state.artwork.layers || [];
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (layer.visible === false) continue;

      let halfW = 8;
      let halfH = 4;

      if (layer.type === 'text') {
        const textLen = (layer.text || '').length;
        halfW = Math.max(8, textLen * 1.8);
        halfH = (layer.fontSize || 20) * 0.22;
      } else if (layer.type === 'icon') {
        halfW = (layer.sizePercent || 10) / 2;
        halfH = halfW * aspect;
      } else if (layer.type === 'image') {
        halfW = (layer.sizePercent || 28) / 2;
        halfH = halfW * aspect;
      } else if (layer.type === 'shape') {
        halfW = (layer.widthPercent || 40) / 2;
        halfH = (layer.heightPercent || 25) / 2;
      }

      if (Math.abs(relX - layer.x) <= halfW && Math.abs(relY - layer.y) <= halfH) {
        return layer.id;
      }
    }

    return null;
  }

  getActiveBounds() {
    const state = stateManager.get();
    const { widthMm, heightMm } = state.dimension;
    const aspect = widthMm / heightMm;

    if (this.activeTarget === 'qr1') {
      const q1 = state.qrCode || {};
      const size = q1.sizePercent || 42;
      const halfW = (size * 1.14) / 2;
      const halfH = (size * aspect * 1.14) / 2;
      const px = q1.posX !== undefined ? q1.posX : 50;
      const py = q1.posY !== undefined ? q1.posY : 68;
      return {
        left: px - halfW,
        top: py - halfH,
        width: halfW * 2,
        height: halfH * 2,
        posX: px,
        posY: py,
        size
      };
    }

    if (this.activeTarget === 'qr2') {
      const q2 = state.qrCode2 || {};
      const size = q2.sizePercent || 32;
      const halfW = (size * 1.14) / 2;
      const halfH = (size * aspect * 1.14) / 2;
      const px = q2.posX !== undefined ? q2.posX : 72;
      const py = q2.posY !== undefined ? q2.posY : 68;
      return {
        left: px - halfW,
        top: py - halfH,
        width: halfW * 2,
        height: halfH * 2,
        posX: px,
        posY: py,
        size
      };
    }

    const layers = state.artwork.layers || [];
    const layer = layers.find(l => l.id === this.activeTarget);
    if (layer) {
      let halfW = 8;
      let halfH = 4;
      let size = 20;

      if (layer.type === 'text') {
        const textLen = (layer.text || '').length;
        halfW = Math.max(10, textLen * 1.9);
        halfH = Math.max(3, (layer.fontSize || 20) * 0.24);
        size = layer.fontSize || 20;
      } else if (layer.type === 'icon') {
        size = layer.sizePercent || 10;
        halfW = size / 2;
        halfH = halfW * aspect;
      } else if (layer.type === 'image') {
        size = layer.sizePercent || 28;
        halfW = size / 2;
        halfH = halfW * aspect;
      } else if (layer.type === 'shape') {
        halfW = (layer.widthPercent || 40) / 2;
        halfH = (layer.heightPercent || 25) / 2;
        size = layer.widthPercent || 40;
      }

      return {
        left: layer.x - halfW,
        top: layer.y - halfH,
        width: halfW * 2,
        height: halfH * 2,
        posX: layer.x,
        posY: layer.y,
        size
      };
    }

    return null;
  }

  updateTransformBox() {
    const box = document.getElementById('transform-box');
    const pill = document.getElementById('transform-size-pill');
    if (!box) return;

    const bounds = this.getActiveBounds();
    if (!bounds) {
      box.classList.add('hidden');
      return;
    }

    box.classList.remove('hidden');
    box.style.left = `${bounds.left}%`;
    box.style.top = `${bounds.top}%`;
    box.style.width = `${bounds.width}%`;
    box.style.height = `${bounds.height}%`;

    if (pill) {
      pill.textContent = `${Math.round(bounds.size)}%`;
    }
  }

  // --- 9. ARRASTO NO CANVAS 2D E ATALHOS ---
  bind2DCanvasDragging() {
    const previewCanvas2D = document.getElementById('preview-2d-canvas');
    const btnCenter2D = document.getElementById('btn-2d-center-current');
    const btnDragImg = document.getElementById('btn-2d-drag-img');
    const btnDragQr = document.getElementById('btn-2d-drag-qr');
    const btnBringFront = document.getElementById('btn-2d-bring-front');
    const btnSendBack = document.getElementById('btn-2d-send-back');

    btnCenter2D?.addEventListener('click', () => {
      this.centerCurrentSelection();
    });

    btnDragImg?.addEventListener('click', () => {
      const layers = stateManager.get('artwork.layers') || [];
      if (!layers.length) {
        showToast('Nenhuma imagem ou camada criada ainda. Crie uma no menu lateral!', 'info');
        return;
      }
      const currentIndex = layers.findIndex(l => l.id === this.activeTarget);
      if (currentIndex !== -1 && layers.length > 1) {
        const nextLayer = layers[(currentIndex + 1) % layers.length];
        this.setActiveTarget(nextLayer.id);
      } else {
        const imgLayer = layers.find(l => l.type === 'image') || layers[0];
        this.setActiveTarget(imgLayer.id);
      }
    });

    btnDragQr?.addEventListener('click', () => {
      const qr2Enabled = stateManager.get('qrCode2.enabled');
      if (this.activeTarget === 'qr1' && qr2Enabled) {
        this.setActiveTarget('qr2');
      } else {
        this.setActiveTarget('qr1');
      }
    });

    btnBringFront?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.bringLayerToFront(this.activeTarget);
        showToast('Elemento colocado por cima de todos!', 'success');
        this.updateTransformBox();
        this.renderLayersList();
      } else {
        showToast('Selecione uma imagem ou camada para trazer para a frente.', 'info');
      }
    });

    btnSendBack?.addEventListener('click', () => {
      if (this.activeTarget && !this.activeTarget.startsWith('qr')) {
        stateManager.sendLayerToBack(this.activeTarget);
        showToast('Elemento colocado por trás de todos!', 'info');
        this.updateTransformBox();
        this.renderLayersList();
      } else {
        showToast('Selecione uma imagem ou camada para enviar para trás.', 'info');
      }
    });

    previewCanvas2D?.addEventListener('dblclick', () => {
      this.centerCurrentSelection();
    });

    if (!previewCanvas2D) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startElemX = 50;
    let startElemY = 50;

    previewCanvas2D.addEventListener('pointerdown', (e) => {
      const rect = previewCanvas2D.getBoundingClientRect();
      const clickRelX = ((e.clientX - rect.left) / rect.width) * 100;
      const clickRelY = ((e.clientY - rect.top) / rect.height) * 100;

      const hit = this.getElementAtPoint(clickRelX, clickRelY);
      if (hit) {
        this.setActiveTarget(hit);
      }

      const bounds = this.getActiveBounds();
      if (!bounds) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startElemX = bounds.posX;
      startElemY = bounds.posY;

      previewCanvas2D.style.cursor = 'grabbing';
      previewCanvas2D.setPointerCapture(e.pointerId);
    });

    previewCanvas2D.addEventListener('pointermove', (e) => {
      const rect = previewCanvas2D.getBoundingClientRect();
      const mouseRelX = ((e.clientX - rect.left) / rect.width) * 100;
      const mouseRelY = ((e.clientY - rect.top) / rect.height) * 100;

      if (!isDragging) {
        const hit = this.getElementAtPoint(mouseRelX, mouseRelY);
        previewCanvas2D.style.cursor = hit ? 'move' : 'default';
        return;
      }

      const deltaX = ((e.clientX - startX) / rect.width) * 100;
      const deltaY = ((e.clientY - startY) / rect.height) * 100;

      let newX = startElemX + deltaX;
      let newY = startElemY + deltaY;

      // Snap magnético ao centro da placa (50%)
      if (Math.abs(newX - 50) <= 2.2) newX = 50;
      if (Math.abs(newY - 50) <= 2.2) newY = 50;

      newX = Math.round(Math.min(92, Math.max(8, newX)));
      newY = Math.round(Math.min(92, Math.max(8, newY)));

      if (this.activeTarget === 'qr1') {
        stateManager.update('qrCode', { posX: newX, posY: newY });
      } else if (this.activeTarget === 'qr2') {
        stateManager.update('qrCode2', { posX: newX, posY: newY });
      } else {
        stateManager.updateLayer(this.activeTarget, { x: newX, y: newY });
      }

      this.updateTransformBox();
    });

    const endDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        previewCanvas2D.style.cursor = 'default';
        try { previewCanvas2D.releasePointerCapture(e.pointerId); } catch {}
      }
    };

    previewCanvas2D.addEventListener('pointerup', endDrag);
    previewCanvas2D.addEventListener('pointercancel', endDrag);
  }

  centerCurrentSelection() {
    if (!this.activeTarget) return;

    if (this.activeTarget === 'qr1') {
      stateManager.update('qrCode', { posX: 50, posY: 56 });
    } else if (this.activeTarget === 'qr2') {
      stateManager.update('qrCode2', { posX: 50, posY: 56 });
    } else {
      stateManager.updateLayer(this.activeTarget, { x: 50 });
    }

    this.updateTransformBox();
    showToast('Elemento centralizado na placa!', 'info');
  }

  // --- 10. ALÇAS DE REDIMENSIONAMENTO NO TRANSFORM BOX ---
  bindTransformBoxHandles() {
    const handles = document.querySelectorAll('.transform-handle');
    const previewWrapper = document.getElementById('preview-canvas-wrapper');
    if (!handles.length || !previewWrapper) return;

    handles.forEach(handle => {
      handle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const bounds = this.getActiveBounds();
        if (!bounds) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startSize = bounds.size;
        const rect = previewWrapper.getBoundingClientRect();

        const onPointerMove = (ev) => {
          const deltaX = ((ev.clientX - startX) / rect.width) * 100;
          const deltaY = ((ev.clientY - startY) / rect.height) * 100;
          const delta = Math.hypot(deltaX, deltaY) * (deltaX > 0 || deltaY > 0 ? 1 : -1);

          let newSize = Math.round(Math.min(95, Math.max(6, startSize + delta)));

          if (this.activeTarget === 'qr1') {
            stateManager.set('qrCode.sizePercent', newSize);
          } else if (this.activeTarget === 'qr2') {
            stateManager.set('qrCode2.sizePercent', newSize);
          } else {
            const layer = (stateManager.get('artwork.layers') || []).find(l => l.id === this.activeTarget);
            if (layer) {
              if (layer.type === 'text') stateManager.updateLayer(layer.id, { fontSize: Math.round(newSize) });
              else if (layer.type === 'shape') stateManager.updateLayer(layer.id, { widthPercent: newSize });
              else stateManager.updateLayer(layer.id, { sizePercent: newSize });
            }
          }

          this.updateTransformBox();
        };

        const onPointerUp = () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      });
    });
  }

  bindScaleButtons() {
    const btnDown = document.getElementById('btn-scale-down');
    const btnUp = document.getElementById('btn-scale-up');
    const btnMicroMinus = document.getElementById('btn-micro-minus');
    const btnMicroPlus = document.getElementById('btn-micro-plus');

    const stepScale = (delta) => {
      const bounds = this.getActiveBounds();
      if (!bounds) return;

      let newSize = Math.round(Math.min(95, Math.max(6, bounds.size + delta)));

      if (this.activeTarget === 'qr1') {
        stateManager.set('qrCode.sizePercent', newSize);
      } else if (this.activeTarget === 'qr2') {
        stateManager.set('qrCode2.sizePercent', newSize);
      } else {
        const layer = (stateManager.get('artwork.layers') || []).find(l => l.id === this.activeTarget);
        if (layer) {
          if (layer.type === 'text') stateManager.updateLayer(layer.id, { fontSize: Math.round(newSize) });
          else if (layer.type === 'shape') stateManager.updateLayer(layer.id, { widthPercent: newSize });
          else stateManager.updateLayer(layer.id, { sizePercent: newSize });
        }
      }

      this.updateTransformBox();
    };

    btnDown?.addEventListener('click', () => stepScale(-4));
    btnUp?.addEventListener('click', () => stepScale(4));
    btnMicroMinus?.addEventListener('click', () => stepScale(-3));
    btnMicroPlus?.addEventListener('click', () => stepScale(3));
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignora atalhos se o foco estiver dentro de um campo de texto ou input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteActiveElement();
      }
    });
  }

  bindDimensionsControls() {
    const widthInput = document.getElementById('input-dim-width');
    const heightInput = document.getElementById('input-dim-height');
    const btnReset = document.getElementById('btn-reset-dimensions');
    const chipText = document.getElementById('spec-chip-text');
    const exportDimLabel = document.getElementById('export-dimension-label');

    if (!widthInput || !heightInput) return;

    const updateDimensions = () => {
      const w = parseFloat(widthInput.value) || DEFAULT_DIMENSIONS.widthMm / 10;
      const h = parseFloat(heightInput.value) || DEFAULT_DIMENSIONS.heightMm / 10;
      const widthMm = Math.round(w * 10);
      const heightMm = Math.round(h * 10);

      stateManager.update('dimension', { widthMm, heightMm });
      const label = `${widthMm} x ${heightMm} mm • Acrílico Branco 2mm`;
      if (chipText) chipText.textContent = label;
      if (exportDimLabel) exportDimLabel.textContent = `${widthMm} x ${heightMm} mm • 300 DPI em escala 1:1`;
    };

    widthInput.addEventListener('change', updateDimensions);
    heightInput.addEventListener('change', updateDimensions);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        widthInput.value = '11';
        heightInput.value = '15';
        updateDimensions();
        showToast('Dimensões restauradas para 11 x 15 cm', 'info');
      });
    }
  }

  bindViewControls() {
    const btn3D = document.getElementById('btn-view-3d');
    const btn2D = document.getElementById('btn-view-2d');
    const view3D = document.getElementById('three-canvas-container');
    const view2D = document.getElementById('print-2d-preview');
    const cameraBtns = document.querySelectorAll('.camera-btn');
    const autoRotateBtn = document.getElementById('btn-toggle-autorotate');
    const resetCameraBtn = document.getElementById('btn-reset-camera');

    const viewportContainer = document.getElementById('viewport-container');

    btn3D?.addEventListener('click', () => {
      btn3D.classList.add('active');
      btn2D?.classList.remove('active');
      view3D?.classList.remove('hidden');
      view2D?.classList.add('hidden');
      viewportContainer?.classList.remove('mode-2d');
      stateManager.set('view.is3DMode', true);
    });

    btn2D?.addEventListener('click', () => {
      btn2D.classList.add('active');
      btn3D?.classList.remove('active');
      view2D?.classList.remove('hidden');
      view3D?.classList.add('hidden');
      viewportContainer?.classList.add('mode-2d');
      stateManager.set('view.is3DMode', false);
      this.updateTransformBox();
    });

    cameraBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        cameraBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        stateManager.set('view.cameraPreset', btn.getAttribute('data-preset'));
      });
    });

    autoRotateBtn?.addEventListener('click', () => {
      const active = autoRotateBtn.classList.toggle('active');
      stateManager.set('view.autoRotate', active);
    });

    resetCameraBtn?.addEventListener('click', () => {
      stateManager.emit('camera:reset');
      showToast('Câmera 3D resetada', 'info');
    });
  }

  updateGuidesOverlay() {}
}
