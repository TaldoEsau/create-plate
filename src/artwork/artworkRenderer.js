import { drawGoogleRoundedFrame, drawCropGuides } from './templates.js';
import { getIconById } from './iconLibrary.js';

class ArtworkRenderer {
  constructor() {
    this.imageCache = new Map();
  }

  /**
   * Carrega e armazena imagem em cache de forma assíncrona.
   */
  async loadImage(url) {
    if (!url) return null;
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn('Falha ao carregar imagem:', url);
        resolve(null);
      };
      img.src = url;
    });
  }

  /**
   * Renderiza a arte completa (Camadas do Studio, Imagens Múltiplas, Ícones, Textos e QR Codes).
   * @param {Object} artworkConfig
   * @param {HTMLCanvasElement|null} qrCanvas1
   * @param {HTMLCanvasElement|null} qrCanvas2
   * @param {Object} dimensions
   * @param {Object} options - { widthPx, heightPx, dpi, includeCropMarks }
   * @param {Object|null} qrConfig1
   * @param {Object|null} qrConfig2
   * @returns {Promise<HTMLCanvasElement>}
   */
  async renderArtwork(artworkConfig, qrCanvas1, qrCanvas2, dimensions, options, qrConfig1 = null, qrConfig2 = null) {
    const { widthPx, heightPx, includeCropMarks = false } = options;
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // 1. Fundo Base da Placa
    await this.renderBackground(ctx, artworkConfig, widthPx, heightPx);

    // 2. Renderiza Camadas Livres (Texto, Imagens Múltiplas, Ícones, Formas)
    if (artworkConfig.layers && Array.isArray(artworkConfig.layers)) {
      for (const layer of artworkConfig.layers) {
        if (layer.visible === false) continue;
        await this.renderLayer(ctx, layer, widthPx, heightPx);
      }
    }

    // 3. Renderiza QR Code 1 (se ativado)
    if (qrCanvas1 && qrConfig1 && qrConfig1.enabled !== false) {
      this.renderQRCodeOnPlaque(ctx, qrCanvas1, qrConfig1, widthPx, heightPx);
    }

    // 4. Renderiza QR Code 2 (se ativado)
    if (qrCanvas2 && qrConfig2 && qrConfig2.enabled === true) {
      this.renderQRCodeOnPlaque(ctx, qrCanvas2, qrConfig2, widthPx, heightPx);
    }

    // 5. Linhas e Guias de Corte para Gráfica (se solicitado na exportação)
    if (includeCropMarks) {
      drawCropGuides(ctx, widthPx, heightPx, Math.round(widthPx * 0.03));
    }

    return canvas;
  }

  /**
   * Renderiza a cor sólida, gradiente ou imagem de fundo.
   */
  async renderBackground(ctx, config, width, height) {
    const bgColor = config.backgroundColor || '#ffffff';

    if (config.backgroundGradient && config.backgroundGradient.colors) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const cols = config.backgroundGradient.colors;
      grad.addColorStop(0, cols[0]);
      grad.addColorStop(1, cols[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Imagem de fundo completa
    const bgUrl = config.backgroundImageUrl || config.customUploadedImageUrl;
    if (bgUrl) {
      const img = await this.loadImage(bgUrl);
      if (img) {
        ctx.save();
        ctx.globalAlpha = config.bgOpacity !== undefined ? config.bgOpacity : 1.0;
        
        const fitMode = config.bgFitMode || config.fitMode || 'cover';
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let baseW, baseH;

        if (fitMode === 'contain') {
          if (imgAspect > canvasAspect) {
            baseW = width;
            baseH = width / imgAspect;
          } else {
            baseH = height;
            baseW = height * imgAspect;
          }
        } else {
          // cover
          if (imgAspect > canvasAspect) {
            baseH = height;
            baseW = height * imgAspect;
          } else {
            baseW = width;
            baseH = width / imgAspect;
          }
        }

        const scaleMult = config.bgScale !== undefined ? config.bgScale : (config.imageScale || 1.0);
        const offX = (((config.bgOffsetX !== undefined ? config.bgOffsetX : config.imageOffsetX) || 0) / 100) * width;
        const offY = (((config.bgOffsetY !== undefined ? config.bgOffsetY : config.imageOffsetY) || 0) / 100) * height;

        const drawW = baseW * scaleMult;
        const drawH = baseH * scaleMult;
        const drawX = ((width - drawW) / 2) + offX;
        const drawY = ((height - drawH) / 2) + offY;

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }
  }

  /**
   * Renderiza uma camada individual (texto, imagem, ícone, forma).
   */
  async renderLayer(ctx, layer, width, height) {
    const scale = width / 700; // Escala proporcional padrão baseada na largura de 700px
    const posX = (layer.x / 100) * width;
    const posY = (layer.y / 100) * height;

    ctx.save();
    if (layer.opacity !== undefined) {
      ctx.globalAlpha = layer.opacity;
    }

    if (layer.type === 'text') {
      const fontSizePx = Math.round((layer.fontSize || 20) * scale);
      const fontWeight = layer.fontWeight || '600';
      const fontFamily = layer.fontFamily || 'Outfit';
      ctx.font = `${fontWeight} ${fontSizePx}px '${fontFamily}', sans-serif`;
      ctx.fillStyle = layer.color || '#202124';
      ctx.textAlign = layer.align || 'center';
      ctx.textBaseline = 'middle';

      // Sombra sutil se configurada
      if (layer.hasShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4 * scale;
        ctx.shadowOffsetY = 2 * scale;
      }

      ctx.fillText(layer.text || '', posX, posY);

    } else if (layer.type === 'icon') {
      const sizePx = Math.round(width * ((layer.sizePercent || 8) / 100));
      const icon = getIconById(layer.iconName);

      if (layer.badgeBackground) {
        // Círculo ou pílula de fundo para o ícone
        ctx.fillStyle = layer.badgeBackground;
        ctx.beginPath();
        ctx.arc(posX, posY, sizePx * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }

      if (icon && icon.draw) {
        icon.draw(ctx, posX - (sizePx / 2), posY - (sizePx / 2), sizePx, layer.color || '#000000');
      }

    } else if (layer.type === 'image' && layer.url) {
      const img = await this.loadImage(layer.url);
      if (img) {
        const sizePercent = layer.sizePercent || 25;
        const drawW = Math.round(width * (sizePercent / 100));
        const aspect = img.height / img.width;
        const drawH = Math.round(drawW * aspect);
        const drawX = Math.round(posX - (drawW / 2));
        const drawY = Math.round(posY - (drawH / 2));

        if (layer.borderRadius) {
          ctx.beginPath();
          ctx.roundRect(drawX, drawY, drawW, drawH, Math.round(layer.borderRadius * scale));
          ctx.clip();
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }

    } else if (layer.type === 'shape') {
      const wPx = Math.round(width * ((layer.widthPercent || 30) / 100));
      const hPx = Math.round(height * ((layer.heightPercent || 15) / 100));
      const drawX = Math.round(posX - (wPx / 2));
      const drawY = Math.round(posY - (hPx / 2));

      if (layer.shapeType === 'card' || layer.shapeType === 'rect') {
        ctx.fillStyle = layer.color || '#f8fafc';
        const radius = Math.round((layer.borderRadius || 16) * scale);
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, wPx, hPx, radius);
        ctx.fill();

        if (layer.borderColor) {
          ctx.strokeStyle = layer.borderColor;
          ctx.lineWidth = Math.max(1, Math.round((layer.borderWidth || 1) * scale));
          ctx.stroke();
        }
      } else if (layer.shapeType === 'line' || layer.shapeType === 'divider') {
        ctx.strokeStyle = layer.color || '#e2e8f0';
        ctx.lineWidth = Math.max(1, Math.round((layer.heightPercent || 2) * scale));
        ctx.beginPath();
        ctx.moveTo(drawX, posY);
        ctx.lineTo(drawX + wPx, posY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Posiciona e estampa o QR Code na placa.
   */
  renderQRCodeOnPlaque(ctx, qrCanvas, qrConfig, width, height) {
    const scale = width / 700;
    const qrScale = ((qrConfig.sizePercent || 35) / 100);
    const qrSize = Math.round(width * qrScale);
    const qrCenterX = Math.round(width * ((qrConfig.posX !== undefined ? qrConfig.posX : 50) / 100));
    const qrCenterY = Math.round(height * ((qrConfig.posY !== undefined ? qrConfig.posY : 60) / 100));
    const qrX = Math.round(qrCenterX - (qrSize / 2));
    const qrY = Math.round(qrCenterY - (qrSize / 2));

    // 1. Moldura Google Multicolorida (se ativado)
    if (qrConfig.showFrame) {
      const framePadding = Math.round(18 * scale);
      const totalBox = qrSize + (framePadding * 2);
      drawGoogleRoundedFrame(
        ctx,
        qrX - framePadding,
        qrY - framePadding,
        totalBox,
        totalBox,
        Math.round(28 * scale),
        Math.round(6 * scale)
      );
    }

    // 2. Fundo Branco de Destaque
    if (qrConfig.cardBackground !== false) {
      const pad = Math.round(qrSize * 0.08);
      const cardR = Math.round((qrConfig.cardBorderRadius || 18) * scale);

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - pad, qrY - pad, qrSize + (pad * 2), qrSize + (pad * 2), cardR);
      ctx.fill();

      // Borda sutil de acabamento
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.stroke();
      ctx.restore();
    }

    // 3. Estampa o QR Code
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // 4. Rótulo inferior opcional sob o QR
    if (qrConfig.label && qrConfig.showLabel !== false && qrConfig.label.trim().length > 0) {
      ctx.save();
      ctx.font = `700 ${Math.round(13 * scale)}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(qrConfig.label, qrCenterX, qrY + qrSize + Math.round(12 * scale));
      ctx.restore();
    }
  }
}

export const artworkRenderer = new ArtworkRenderer();
