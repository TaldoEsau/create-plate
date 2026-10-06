import { drawStar, drawGoogleWordmark, drawGoogleRoundedFrame, drawCropGuides } from './templates.js';

class ArtworkRenderer {
  constructor() {
    this.uploadedImageCache = new Map();
  }

  /**
   * Renderiza a arte completa (Template Google ou Imagem Carregada) em um canvas com as dimensões especificadas.
   * @param {Object} artworkConfig
   * @param {HTMLCanvasElement|null} qrCanvas
   * @param {Object} dimensions
   * @param {Object} options - { widthPx, heightPx, dpi, includeCropMarks }
   * @param {Object|null} qrConfig - Configurações de posicionamento do QR Code
   * @returns {Promise<HTMLCanvasElement>}
   */
  async renderArtwork(artworkConfig, qrCanvas, dimensions, options, qrConfig = null) {
    const { widthPx, heightPx, includeCropMarks = false } = options;
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // Fundo branco base da placa
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    if (artworkConfig.mode === 'custom_upload' && artworkConfig.customUploadedImageUrl) {
      await this.renderCustomUpload(ctx, artworkConfig, qrCanvas, qrConfig, widthPx, heightPx);
    } else {
      await this.renderGoogleReviewTemplate(ctx, artworkConfig, qrCanvas, widthPx, heightPx);
    }

    if (includeCropMarks) {
      drawCropGuides(ctx, widthPx, heightPx, Math.round(widthPx * 0.03));
    }

    return canvas;
  }

  /**
   * Renderiza o template de avaliação do Google.
   */
  async renderGoogleReviewTemplate(ctx, config, qrCanvas, width, height) {
    const scale = width / 700; // Fator de escala proporcional

    // 1. Estrelas de Avaliação no topo
    const starCount = config.starsCount || 5;
    const starRadius = 18 * scale;
    const starSpacing = 42 * scale;
    const starsTotalWidth = (starCount - 1) * starSpacing;
    const startStarX = (width / 2) - (starsTotalWidth / 2);
    const starY = 85 * scale;

    for (let i = 0; i < starCount; i++) {
      drawStar(ctx, startStarX + (i * starSpacing), starY, 5, starRadius, starRadius * 0.48, config.starsColor || '#FBBC05');
    }

    // 2. Linha de Texto Superior ("Nos avalie no")
    ctx.save();
    ctx.font = `600 ${Math.round(28 * scale)}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#202124';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleLine1 = config.titleLine1 || 'Nos avalie no';
    ctx.fillText(titleLine1, width / 2, 142 * scale);
    ctx.restore();

    // 3. Marca / Google Wordmark
    const titleBrand = config.titleBrand || 'Google';
    if (titleBrand.toLowerCase() === 'google') {
      drawGoogleWordmark(ctx, width / 2, 192 * scale, Math.round(44 * scale));
    } else {
      ctx.save();
      ctx.font = `800 ${Math.round(42 * scale)}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#1a73e8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleBrand, width / 2, 192 * scale);
      ctx.restore();
    }

    // 4. Área do QR Code com Moldura Google
    const qrBoxSize = Math.round(width * 0.76); // QR Code ocupa 76% da largura útil
    const qrBoxX = Math.round((width - qrBoxSize) / 2);
    const qrBoxY = Math.round(245 * scale);
    const framePadding = Math.round(18 * scale);

    if (config.showFrame) {
      drawGoogleRoundedFrame(
        ctx,
        qrBoxX,
        qrBoxY,
        qrBoxSize,
        qrBoxSize,
        Math.round(28 * scale),
        Math.round(7 * scale)
      );
    }

    // Renderiza o QR Code no centro da moldura
    if (qrCanvas) {
      const qrInnerSize = qrBoxSize - (framePadding * 2);
      const qrInnerX = qrBoxX + framePadding;
      const qrInnerY = qrBoxY + framePadding;
      ctx.drawImage(qrCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
    }

    // 5. Chamada de Rodapé ("APONTE A CÂMERA E AVALIE!")
    ctx.save();
    ctx.font = `800 ${Math.round(22 * scale)}px 'Outfit', sans-serif`;
    ctx.fillStyle = '#202124';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${2 * scale}px`;
    const footerText = config.footerCallout || 'APONTE A CÂMERA E AVALIE!';
    ctx.fillText(footerText, width / 2, height - (75 * scale));
    ctx.restore();
  }

  /**
   * Renderiza a arte carregada diretamente pelo usuário ajustada à placa,
   * permitindo centralização, pan/zoom e sobreposição do QR Code em posição livre.
   */
  async renderCustomUpload(ctx, config, qrCanvas, qrConfig, width, height) {
    const imgUrl = config.customUploadedImageUrl;
    let img = this.uploadedImageCache.get(imgUrl);

    if (!img) {
      img = new Image();
      img.src = imgUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      });
      this.uploadedImageCache.set(imgUrl, img);
    }

    const fitMode = config.fitMode || 'cover';
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    const scaleMult = config.imageScale !== undefined ? Number(config.imageScale) : 1.0;
    const offX = ((config.imageOffsetX || 0) / 100) * width;
    const offY = ((config.imageOffsetY || 0) / 100) * height;

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
      // 'cover'
      if (imgAspect > canvasAspect) {
        baseH = height;
        baseW = height * imgAspect;
      } else {
        baseW = width;
        baseH = width / imgAspect;
      }
    }

    const drawW = baseW * scaleMult;
    const drawH = baseH * scaleMult;
    const drawX = ((width - drawW) / 2) + offX;
    const drawY = ((height - drawH) / 2) + offY;

    ctx.save();
    // Limita o desenho estritamente à área frontal da placa
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // 2. Sobreposição do QR Code na posição livre escolhida pelo usuário
    if (qrCanvas && qrConfig && qrConfig.showOnUpload !== false) {
      const qrScale = ((qrConfig.sizePercent || 40) / 100);
      const qrSize = Math.round(width * qrScale);
      const qrCenterX = Math.round(width * ((qrConfig.posX !== undefined ? qrConfig.posX : 50) / 100));
      const qrCenterY = Math.round(height * ((qrConfig.posY !== undefined ? qrConfig.posY : 68) / 100));
      const qrX = Math.round(qrCenterX - (qrSize / 2));
      const qrY = Math.round(qrCenterY - (qrSize / 2));

      // Se ativado, desenha o cartão branco arredondado sem nenhuma sombra
      if (qrConfig.cardBackground !== false) {
        const pad = Math.round(qrSize * 0.08);
        const cardR = Math.round(18 * (width / 700));

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qrX - pad, qrY - pad, qrSize + (pad * 2), qrSize + (pad * 2), cardR);
        ctx.fill();
        ctx.restore();
      }

      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }
  }
}

export const artworkRenderer = new ArtworkRenderer();
