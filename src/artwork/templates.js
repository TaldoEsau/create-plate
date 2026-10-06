import { GOOGLE_COLORS } from '../core/constants.js';

/**
 * Desenha uma estrela vetorial de 5 pontas no contexto 2D.
 */
export function drawStar(ctx, cx, cy, spikes = 5, outerRadius = 16, innerRadius = 7.5, color = '#FBBC05') {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Desenha o texto "Google" com as cores oficiais de cada letra ou desenha palavra estilizada.
 */
export function drawGoogleWordmark(ctx, x, y, fontSize = 48) {
  ctx.save();
  ctx.font = `800 ${fontSize}px 'Outfit', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letters = [
    { char: 'G', color: GOOGLE_COLORS.blue },
    { char: 'o', color: GOOGLE_COLORS.red },
    { char: 'o', color: GOOGLE_COLORS.yellow },
    { char: 'g', color: GOOGLE_COLORS.blue },
    { char: 'l', color: GOOGLE_COLORS.green },
    { char: 'e', color: GOOGLE_COLORS.red }
  ];

  // Calcular largura total para centralização
  let totalWidth = 0;
  const widths = letters.map(item => {
    const w = ctx.measureText(item.char).width;
    totalWidth += w;
    return w;
  });

  let currentX = x - (totalWidth / 2);

  letters.forEach((item, idx) => {
    ctx.fillStyle = item.color;
    ctx.fillText(item.char, currentX + (widths[idx] / 2), y);
    currentX += widths[idx];
  });

  ctx.restore();
}

/**
 * Desenha a moldura de 4 cores do Google (Amarelo no topo, Vermelho na direita, Azul na base, Verde na esquerda).
 */
export function drawGoogleRoundedFrame(ctx, x, y, width, height, radius = 24, strokeWidth = 8) {
  ctx.save();
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const r = Math.min(radius, width / 4, height / 4);

  // Top (Amarelo)
  ctx.strokeStyle = GOOGLE_COLORS.yellow;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.stroke();

  // Right (Vermelho)
  ctx.strokeStyle = GOOGLE_COLORS.red;
  ctx.beginPath();
  ctx.moveTo(x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.stroke();

  // Bottom (Azul)
  ctx.strokeStyle = GOOGLE_COLORS.blue;
  ctx.beginPath();
  ctx.moveTo(x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.stroke();

  // Left (Verde)
  ctx.strokeStyle = GOOGLE_COLORS.green;
  ctx.beginPath();
  ctx.moveTo(x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + width / 2, y);
  ctx.stroke();

  ctx.restore();
}

/**
 * Desenha linhas de corte suaves e marcas de registro nas 4 pontas.
 */
export function drawCropGuides(ctx, width, height, marginPx = 20) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Retângulo tracejado de segurança
  ctx.strokeRect(marginPx, marginPx, width - (marginPx * 2), height - (marginPx * 2));

  // Marcas de canto sólidas
  ctx.setLineDash([]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;

  const markLen = 14;
  // Canto superior esquerdo
  ctx.beginPath();
  ctx.moveTo(marginPx, marginPx - markLen); ctx.lineTo(marginPx, marginPx);
  ctx.moveTo(marginPx - markLen, marginPx); ctx.lineTo(marginPx, marginPx);
  // Canto superior direito
  ctx.moveTo(width - marginPx, marginPx - markLen); ctx.lineTo(width - marginPx, marginPx);
  ctx.moveTo(width - marginPx + markLen, marginPx); ctx.lineTo(width - marginPx, marginPx);
  // Canto inferior esquerdo
  ctx.moveTo(marginPx, height - marginPx + markLen); ctx.lineTo(marginPx, height - marginPx);
  ctx.moveTo(marginPx - markLen, height - marginPx); ctx.lineTo(marginPx, height - marginPx);
  // Canto inferior direito
  ctx.moveTo(width - marginPx, height - marginPx + markLen); ctx.lineTo(width - marginPx, height - marginPx);
  ctx.moveTo(width - marginPx + markLen, height - marginPx); ctx.lineTo(width - marginPx, height - marginPx);
  ctx.stroke();

  ctx.restore();
}
