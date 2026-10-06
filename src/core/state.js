import { DEFAULT_DIMENSIONS } from './constants.js';

class StateManager {
  constructor() {
    this.listeners = new Map();

    this.state = {
      dimension: { ...DEFAULT_DIMENSIONS },
      qrCode: {
        url: 'https://google.com',
        fgColor: '#000000',
        dotsStyle: 'rounded',       // 'rounded' | 'dots' | 'square'
        logoChoice: 'google',       // 'google' | 'custom' | 'none'
        customLogoUrl: null,
        transparentBg: false,
        errorCorrectionLevel: 'H',
        // Novas opções de posicionamento livre
        showOnUpload: true,         // Exibir QR Code sobre a arte personalizada enviada
        posX: 50,                   // 0 a 100% (horizontal)
        posY: 68,                   // 0 a 100% (vertical)
        sizePercent: 42,            // 20% a 75% da largura da placa
        cardBackground: true        // Cartão branco com cantos arredondados sob o QR
      },
      artwork: {
        mode: 'template_google',     // 'template_google' | 'custom_upload'
        titleLine1: 'Nos avalie no',
        titleBrand: 'Google',
        footerCallout: 'APONTE A CÂMERA E AVALIE!',
        starsCount: 5,
        starsColor: '#FBBC05',
        showFrame: true,
        customUploadedImageUrl: null,
        fitMode: 'cover',            // 'cover' | 'contain'
        imageOffsetX: 0,            // -100 a +100 (%)
        imageOffsetY: 0,            // -100 a +100 (%)
        imageScale: 1.0             // 0.5 a 2.5 (zoom)
      },
      view: {
        is3DMode: true,
        cameraPreset: 'perspective',
        autoRotate: false
      }
    };
  }

  get(path) {
    if (!path) return this.state;
    return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), this.state);
  }

  set(path, value, notify = true) {
    const keys = path.split('.');
    let current = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    if (current[lastKey] !== value) {
      current[lastKey] = value;
      if (notify) {
        this.emit('change', { path, value, state: this.state });
        this.emit(`change:${keys[0]}`, this.state[keys[0]]);
      }
    }
  }

  update(section, partialValues) {
    if (this.state[section]) {
      this.state[section] = { ...this.state[section], ...partialValues };
      this.emit('change', { section, values: partialValues, state: this.state });
      this.emit(`change:${section}`, this.state[section]);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  }
}

export const stateManager = new StateManager();
