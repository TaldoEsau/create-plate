import { DEFAULT_DIMENSIONS } from './constants.js';
import { STUDIO_TEMPLATES } from '../artwork/studioTemplates.js';

class StateManager {
  constructor() {
    this.listeners = new Map();

    const initialTemplateState = STUDIO_TEMPLATES[0].createState();

    this.state = {
      dimension: { ...DEFAULT_DIMENSIONS },
      qrCode: initialTemplateState.qrCode,
      qrCode2: initialTemplateState.qrCode2,
      artwork: {
        mode: initialTemplateState.mode || 'studio',
        backgroundColor: initialTemplateState.backgroundColor || '#ffffff',
        backgroundGradient: null,
        backgroundImageUrl: null,
        bgFitMode: 'cover',
        bgScale: 1.0,
        bgOffsetX: 0,
        bgOffsetY: 0,
        layers: initialTemplateState.layers || [],
        selectedLayerId: null,
        // Retrocompatibilidade
        titleLine1: 'Nos avalie no',
        titleBrand: 'Google',
        footerCallout: 'APONTE A CÂMERA E AVALIE!',
        starsCount: 5,
        starsColor: '#FBBC05',
        showFrame: true,
        customUploadedImageUrl: null,
        fitMode: 'cover',
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1.0
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

  // --- GERENCIAMENTO DE CAMADAS (LAYERS) ESTILO PHOTOSHOP ---

  addLayer(layer) {
    const newLayer = {
      id: layer.id || `layer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      visible: true,
      ...layer
    };
    this.state.artwork.layers.push(newLayer);
    this.state.artwork.selectedLayerId = newLayer.id;
    this.emit('change', { path: 'artwork.layers', value: this.state.artwork.layers, state: this.state });
    this.emit('change:artwork', this.state.artwork);
    return newLayer;
  }

  updateLayer(layerId, partialValues) {
    const layers = this.state.artwork.layers;
    const index = layers.findIndex(l => l.id === layerId);
    if (index !== -1) {
      layers[index] = { ...layers[index], ...partialValues };
      this.emit('change', { path: `artwork.layers.${layerId}`, value: layers[index], state: this.state });
      this.emit('change:artwork', this.state.artwork);
    }
  }

  removeLayer(layerId) {
    this.state.artwork.layers = this.state.artwork.layers.filter(l => l.id !== layerId);
    if (this.state.artwork.selectedLayerId === layerId) {
      this.state.artwork.selectedLayerId = null;
    }
    this.emit('change', { path: 'artwork.layers', value: this.state.artwork.layers, state: this.state });
    this.emit('change:artwork', this.state.artwork);
  }

  duplicateLayer(layerId) {
    const layer = this.state.artwork.layers.find(l => l.id === layerId);
    if (!layer) return null;

    const duplicated = {
      ...JSON.parse(JSON.stringify(layer)),
      id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${layer.name || 'Elemento'} (Cópia)`,
      x: Math.min(85, (layer.x || 50) + 4),
      y: Math.min(85, (layer.y || 50) + 4)
    };

    return this.addLayer(duplicated);
  }

  bringLayerToFront(layerId) {
    const layers = this.state.artwork.layers;
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === layers.length - 1) return;
    const [layer] = layers.splice(index, 1);
    layers.push(layer);
    this.emit('change', { path: 'artwork.layers', value: layers, state: this.state });
    this.emit('change:artwork', this.state.artwork);
  }

  sendLayerToBack(layerId) {
    const layers = this.state.artwork.layers;
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1 || index === 0) return;
    const [layer] = layers.splice(index, 1);
    layers.unshift(layer);
    this.emit('change', { path: 'artwork.layers', value: layers, state: this.state });
    this.emit('change:artwork', this.state.artwork);
  }

  reorderLayer(layerId, direction) {
    const layers = this.state.artwork.layers;
    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) return;

    if (direction === 'up' && index < layers.length - 1) {
      const temp = layers[index];
      layers[index] = layers[index + 1];
      layers[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = layers[index];
      layers[index] = layers[index - 1];
      layers[index - 1] = temp;
    }

    this.emit('change', { path: 'artwork.layers', value: layers, state: this.state });
    this.emit('change:artwork', this.state.artwork);
  }

  selectLayer(layerId) {
    this.state.artwork.selectedLayerId = layerId;
    this.emit('layer:selected', layerId);
    this.emit('change', { path: 'artwork.selectedLayerId', value: layerId, state: this.state });
  }

  loadTemplate(templateId) {
    const tmpl = STUDIO_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    const newState = tmpl.createState();
    this.state.qrCode = { ...this.state.qrCode, ...newState.qrCode };
    this.state.qrCode2 = { ...this.state.qrCode2, ...newState.qrCode2 };
    this.state.artwork = {
      ...this.state.artwork,
      mode: newState.mode || 'studio',
      backgroundColor: newState.backgroundColor || '#ffffff',
      backgroundGradient: newState.backgroundGradient || null,
      backgroundImageUrl: newState.backgroundImageUrl || null,
      layers: newState.layers || [],
      selectedLayerId: null
    };

    this.emit('change:qrCode', this.state.qrCode);
    this.emit('change:qrCode2', this.state.qrCode2);
    this.emit('change:artwork', this.state.artwork);
    this.emit('change', { section: 'all', state: this.state });
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
