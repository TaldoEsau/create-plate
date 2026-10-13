import qrcode from 'qrcode-generator';
import { getIconById } from '../artwork/iconLibrary.js';

// Paths oficiais do logotipo "G" do Google
const PATH_BLUE = new Path2D("M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z");
const PATH_GREEN = new Path2D("M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z");
const PATH_YELLOW = new Path2D("M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z");
const PATH_RED = new Path2D("M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z");

/**
 * Gerador de QR Code vetorial de alta precisão e performance em tempo real.
 * Renderiza nativamente no canvas, com cantos arredondados, olhos estilizados e logotipo central.
 * Suporta múltiplos QR Codes simultâneos e logos como Google, Instagram, WhatsApp, PIX, Wi-Fi, Site, etc.
 */
class QRGeneratorService {
  constructor() {
    this.canvasCache = new Map();
    this.customImageCache = new Map();
  }

  /**
   * Constrói o canvas do QR code estilizado.
   * @param {Object} config - Configurações do QRCodeConfig
   * @param {number} size - Dimensão em pixels (largura e altura quadradas)
   * @returns {Promise<HTMLCanvasElement>}
   */
  async generateQRCode(config, size = 600) {
    if (!config) return null;

    const key = JSON.stringify({
      url: config.url || '',
      fgColor: config.fgColor || '#000000',
      dotsStyle: config.dotsStyle || 'rounded',
      logoChoice: config.logoChoice || 'google',
      customLogoUrl: config.customLogoUrl || '',
      transparentBg: !!config.transparentBg,
      size
    });

    if (this.canvasCache.has(key)) {
      return this.canvasCache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Gera matriz matemática do QR Code
    const qr = qrcode(0, 'H'); // Nível H: até 30% de tolerância a falhas para acomodar logo
    const textData = config.url && config.url.trim().length > 0 ? config.url.trim() : 'https://google.com';
    try {
      qr.addData(textData);
      qr.make();
    } catch {
      // Fallback para string básica caso ocorra erro no payload
      const safeQr = qrcode(0, 'M');
      safeQr.addData(textData.substring(0, 80));
      safeQr.make();
    }

    const count = qr.getModuleCount();
    const marginModules = 2;
    const totalModules = count + (marginModules * 2);
    const cellSize = size / totalModules;
    const startOffset = marginModules * cellSize;

    // 2. Fundo
    if (!config.transparentBg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.clearRect(0, 0, size, size);
    }

    const fgColor = config.fgColor || '#000000';
    ctx.fillStyle = fgColor;

    // 3. Área reservada para o Logo Central
    const hasLogo = config.logoChoice && config.logoChoice !== 'none';
    const centerX = size / 2;
    const centerY = size / 2;
    // O logo ocupa aproximadamente 24% da área total
    const logoCutoutRadius = hasLogo ? size * 0.16 : 0;

    // 4. Desenha os Módulos de Dados
    const isRounded = config.dotsStyle === 'rounded' || config.dotsStyle === 'dots';

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        // Ignora os 3 padrões localizadores (olhos dos cantos), desenhados separadamente
        const inTopLeftEye = (r < 7 && c < 7);
        const inTopRightEye = (r < 7 && c >= count - 7);
        const inBottomLeftEye = (r >= count - 7 && c < 7);
        if (inTopLeftEye || inTopRightEye || inBottomLeftEye) {
          continue;
        }

        const cellX = startOffset + (c * cellSize);
        const cellY = startOffset + (r * cellSize);
        const cellMidX = cellX + (cellSize / 2);
        const cellMidY = cellY + (cellSize / 2);

        // Se estiver sob a área do logo central, não desenha o ponto
        if (hasLogo) {
          const distToCenter = Math.hypot(cellMidX - centerX, cellMidY - centerY);
          if (distToCenter <= logoCutoutRadius + (cellSize * 0.4)) {
            continue;
          }
        }

        if (qr.isDark(r, c)) {
          if (isRounded) {
            ctx.beginPath();
            ctx.arc(cellMidX, cellMidY, cellSize * 0.44, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(cellX, cellY, cellSize + 0.1, cellSize + 0.1);
          }
        }
      }
    }

    // 5. Desenha os 3 Olhos / Padrões Localizadores (Finder Patterns)
    const drawFinderPattern = (eyeCol, eyeRow) => {
      const eyeX = startOffset + (eyeCol * cellSize);
      const eyeY = startOffset + (eyeRow * cellSize);
      const eyeSize = 7 * cellSize;

      ctx.save();
      
      // Moldura externa
      ctx.lineWidth = cellSize;
      ctx.strokeStyle = fgColor;

      const outerR = isRounded ? cellSize * 2.2 : cellSize * 0.8;
      const innerR = isRounded ? cellSize * 1.2 : cellSize * 0.4;

      // Anel externo
      ctx.beginPath();
      ctx.roundRect(eyeX + (cellSize / 2), eyeY + (cellSize / 2), eyeSize - cellSize, eyeSize - cellSize, outerR);
      ctx.stroke();

      // Ponto central
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.roundRect(eyeX + (2 * cellSize), eyeY + (2 * cellSize), 3 * cellSize, 3 * cellSize, innerR);
      ctx.fill();

      ctx.restore();
    };

    drawFinderPattern(0, 0); // Top-Left
    drawFinderPattern(count - 7, 0); // Top-Right
    drawFinderPattern(0, count - 7); // Bottom-Left

    // 6. Desenha o Logotipo no Centro
    if (hasLogo) {
      // Base circular branca para dar destaque ao logo
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoCutoutRadius, 0, Math.PI * 2);
      ctx.fill();

      // Borda sutil de acabamento
      ctx.lineWidth = Math.max(2, size * 0.005);
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.restore();

      const logoSize = logoCutoutRadius * 1.35;

      if (config.logoChoice === 'google') {
        // Renderiza o "G" multicolorido oficial via Path2D vetorial
        ctx.save();
        ctx.translate(centerX - (logoSize / 2), centerY - (logoSize / 2));
        const scale = logoSize / 24;
        ctx.scale(scale, scale);

        ctx.fillStyle = '#4285F4';
        ctx.fill(PATH_BLUE);

        ctx.fillStyle = '#34A853';
        ctx.fill(PATH_GREEN);

        ctx.fillStyle = '#FBBC05';
        ctx.fill(PATH_YELLOW);

        ctx.fillStyle = '#EA4335';
        ctx.fill(PATH_RED);

        ctx.restore();
      } else if (config.logoChoice === 'instagram') {
        const icon = getIconById('instagram');
        if (icon && icon.draw) {
          icon.draw(ctx, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, '#E1306C');
        }
      } else if (config.logoChoice === 'whatsapp') {
        const icon = getIconById('whatsapp');
        if (icon && icon.draw) {
          icon.draw(ctx, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, '#25D366');
        }
      } else if (config.logoChoice === 'pix') {
        const icon = getIconById('pix');
        if (icon && icon.draw) {
          icon.draw(ctx, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, '#00BDAE');
        }
      } else if (config.logoChoice === 'wifi') {
        const icon = getIconById('wifi');
        if (icon && icon.draw) {
          icon.draw(ctx, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, '#0284c7');
        }
      } else if (config.logoChoice === 'globe' || config.logoChoice === 'site') {
        const icon = getIconById('globe');
        if (icon && icon.draw) {
          icon.draw(ctx, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, '#1e293b');
        }
      } else if (config.logoChoice === 'custom' && config.customLogoUrl) {
        // Logo personalizado enviado pelo usuário
        let customImg = this.customImageCache.get(config.customLogoUrl);
        if (!customImg) {
          customImg = new Image();
          customImg.crossOrigin = 'anonymous';
          customImg.src = config.customLogoUrl;
          await new Promise(res => {
            customImg.onload = res;
            customImg.onerror = res;
          });
          this.customImageCache.set(config.customLogoUrl, customImg);
        }

        if (customImg.complete && customImg.naturalWidth > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(customImg, centerX - (logoSize / 2), centerY - (logoSize / 2), logoSize, logoSize);
          ctx.restore();
        }
      }
    }

    this.canvasCache.set(key, canvas);
    return canvas;
  }
}

export const qrGenerator = new QRGeneratorService();
