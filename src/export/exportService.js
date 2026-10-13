import { jsPDF } from 'jspdf';
import { artworkRenderer } from '../artwork/artworkRenderer.js';
import { qrGenerator } from '../qr/qrGenerator.js';
import { PRINT_SPEC } from '../core/constants.js';

export class ExportService {
  /**
   * Constrói o Canvas Master de Produção a 300 DPI com as medidas milimétricas reais.
   * @param {Object} state - Estado completo { dimension, qrCode, artwork }
   * @param {boolean} includeCropMarks
   * @returns {Promise<HTMLCanvasElement>}
   */
  async generateMasterCanvas(state, includeCropMarks = false) {
    const { widthMm, heightMm } = state.dimension;
    
    // 300 DPI = pixels por polegada (1 polegada = 25.4 mm)
    const widthPx = Math.round((widthMm / 25.4) * PRINT_SPEC.targetDpi);
    const heightPx = Math.round((heightMm / 25.4) * PRINT_SPEC.targetDpi);

    // Gera os QR Codes em resolução ultra-nítida para gráfica (1200x1200px)
    let qrCanvas1 = null;
    let qrCanvas2 = null;

    if (state.qrCode && state.qrCode.enabled !== false) {
      qrCanvas1 = await qrGenerator.generateQRCode(state.qrCode, 1200);
    }

    if (state.qrCode2 && state.qrCode2.enabled === true) {
      qrCanvas2 = await qrGenerator.generateQRCode(state.qrCode2, 1200);
    }

    return await artworkRenderer.renderArtwork(
      state.artwork,
      qrCanvas1,
      qrCanvas2,
      state.dimension,
      {
        widthPx,
        heightPx,
        dpi: PRINT_SPEC.targetDpi,
        includeCropMarks
      },
      state.qrCode,
      state.qrCode2
    );
  }

  /**
   * Dispara o download da imagem em PNG em 300 DPI.
   */
  async downloadPNG(state, filename = null) {
    const { widthMm, heightMm } = state.dimension;
    const defaultName = `placa_personalizada_${widthMm}x${heightMm}mm_300dpi.png`;
    const masterCanvas = await this.generateMasterCanvas(state, false);

    const link = document.createElement('a');
    link.download = filename || defaultName;
    link.href = masterCanvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Dispara o download do PDF vetorial em escala 1:1 nas medidas milimétricas reais.
   */
  async downloadPDF(state, filename = null) {
    const { widthMm, heightMm } = state.dimension;
    const defaultName = `placa_personalizada_${widthMm}x${heightMm}mm_grafica.pdf`;
    const masterCanvas = await this.generateMasterCanvas(state, false);

    const orientation = widthMm > heightMm ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: [widthMm, heightMm]
    });

    const imgData = masterCanvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    pdf.save(filename || defaultName);
  }

  /**
   * Gera e faz o download do Gabarito / Molde da Arte em 300 DPI com as medidas milimétricas exatas,
   * guias de segurança e corte para que o cliente crie a arte no tamanho perfeito.
   */
  downloadTemplate(dimension) {
    const wMm = Number(dimension.widthMm) || 110;
    const hMm = Number(dimension.heightMm) || 150;
    const dpi = 300;

    const widthPx = Math.round((wMm / 25.4) * dpi);   // ex: 1299 px para 110mm
    const heightPx = Math.round((hMm / 25.4) * dpi); // ex: 1772 px para 150mm

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // 1. Fundo do gabarito
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // 2. Linhas de grade suaves de fundo
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridStep = Math.round((10 / 25.4) * dpi); // a cada 10mm
    for (let x = 0; x < widthPx; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, heightPx); ctx.stroke();
    }
    for (let y = 0; y < heightPx; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(widthPx, y); ctx.stroke();
    }

    // 3. Linha Externa de Corte / Borda da Placa (Vermelha)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, widthPx - 8, heightPx - 8);

    // 4. Margem de Segurança Interna (5 mm da borda - Verde tracejada)
    const safeMarginPx = Math.round((5 / 25.4) * dpi);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(safeMarginPx, safeMarginPx, widthPx - (safeMarginPx * 2), heightPx - (safeMarginPx * 2));
    ctx.setLineDash([]);

    // 5. Linhas de Centro (Cruz Central suave)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(widthPx / 2, safeMarginPx); ctx.lineTo(widthPx / 2, heightPx - safeMarginPx);
    ctx.moveTo(safeMarginPx, heightPx / 2); ctx.lineTo(widthPx - safeMarginPx, heightPx / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Card Central com Instruções e Medidas
    const cardW = Math.round(widthPx * 0.78);
    const cardH = Math.round(heightPx * 0.44);
    const cardX = (widthPx - cardW) / 2;
    const cardY = (heightPx - cardH) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Textos do Gabarito
    const scale = widthPx / 1299;
    ctx.textAlign = 'center';

    // Título
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.round(42 * scale)}px Outfit, sans-serif`;
    ctx.fillText('📐 GABARITO OFICIAL DA PLACA', widthPx / 2, cardY + (60 * scale));

    // Medidas Principais
    ctx.fillStyle = '#2563eb';
    ctx.font = `800 ${Math.round(52 * scale)}px Outfit, sans-serif`;
    ctx.fillText(`${wMm} × ${hMm} mm (${wMm / 10} × ${hMm / 10} cm)`, widthPx / 2, cardY + (130 * scale));

    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${Math.round(28 * scale)}px Outfit, sans-serif`;
    ctx.fillText(`Resolução: ${widthPx} × ${heightPx} px @ 300 DPI`, widthPx / 2, cardY + (175 * scale));

    // Separador
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY + (205 * scale));
    ctx.lineTo(cardX + cardW - 40, cardY + (205 * scale));
    ctx.stroke();

    // Legenda de Cores e Instruções
    ctx.textAlign = 'left';
    const textStartX = cardX + (50 * scale);
    let curY = cardY + (255 * scale);
    const lineSpacing = 42 * scale;

    const items = [
      { color: '#ef4444', label: 'Borda Vermelha:', desc: 'Tamanho final de corte da placa (1:1)' },
      { color: '#10b981', label: 'Linha Verde Tracejada:', desc: 'Área Segura (5 mm). Mantenha textos aqui.' },
      { color: '#6366f1', label: 'Formato Recomendado:', desc: 'PNG ou JPG em alta qualidade (RGB)' },
      { color: '#0ea5e9', label: 'Dica do QR Code:', desc: 'Você pode adicionar e mover o QR Code no Estúdio!' }
    ];

    items.forEach(it => {
      // Ponto colorido
      ctx.fillStyle = it.color;
      ctx.beginPath();
      ctx.arc(textStartX, curY - (8 * scale), 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Label negrito
      ctx.font = `bold ${Math.round(22 * scale)}px Outfit, sans-serif`;
      ctx.fillStyle = '#1e293b';
      ctx.fillText(it.label, textStartX + (20 * scale), curY);

      const labelWidth = ctx.measureText(it.label).width;

      // Descrição regular
      ctx.font = `500 ${Math.round(21 * scale)}px Outfit, sans-serif`;
      ctx.fillStyle = '#475569';
      ctx.fillText(it.desc, textStartX + (30 * scale) + labelWidth, curY);

      curY += lineSpacing;
    });

    // Rodapé do Gabarito
    ctx.textAlign = 'center';
    ctx.font = `600 ${Math.round(20 * scale)}px Outfit, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Crie sua arte neste gabarito e faça o upload no Estúdio 3D para visualizar na placa!', widthPx / 2, cardY + cardH - (25 * scale));

    // Dispara o download
    const link = document.createElement('a');
    link.download = `gabarito_placa_${wMm}x${hMm}mm_300dpi.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Abre o assistente de impressão do navegador configurado para escala real sem margens.
   */
  async triggerPrint(state) {
    const { widthMm, heightMm } = state.dimension;
    const masterCanvas = await this.generateMasterCanvas(state, false);
    const dataUrl = masterCanvas.toDataURL('image/png');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor, permita pop-ups no seu navegador para imprimir diretamente.');
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Placa ${widthMm}x${heightMm}mm</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #ffffff;
          }
          img {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
      </html>
    `);
    printWin.document.close();
  }
}

export const exportService = new ExportService();
