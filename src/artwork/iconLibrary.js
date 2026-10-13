/**
 * Biblioteca completa de ícones vetoriais de alta precisão para placas e displays de balcão.
 * Suporta redes sociais, pagamentos (PIX), contato, avaliações e elementos decorativos.
 */

export const ICON_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'social', label: 'Redes Sociais' },
  { id: 'contact', label: 'Contato & Local' },
  { id: 'payment', label: 'Pagamentos' },
  { id: 'badges', label: 'Avaliações & Selos' },
  { id: 'general', label: 'Geral & Símbolos' }
];

export const ICONS_DATA = [
  // REDES SOCIAIS
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    viewBox: '0 0 24 24',
    // Caminho da câmera do Instagram
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Retângulo com cantos arredondados
      ctx.beginPath();
      ctx.roundRect(2, 2, 20, 20, 5);
      ctx.stroke();

      // Lente circular central
      ctx.beginPath();
      ctx.arc(12, 12, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Ponto flash
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(17.5, 6.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'social',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Balão de fala
      ctx.beginPath();
      ctx.arc(12, 12, 9, -Math.PI / 4, Math.PI * 0.78);
      ctx.lineTo(4, 20);
      ctx.lineTo(6.5, 16.5);
      ctx.arc(12, 12, 9, Math.PI * 0.95, -Math.PI / 4);
      ctx.stroke();

      // Telefone interno
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(12, 12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
  },
  {
    id: 'google',
    name: 'Google G',
    category: 'social',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);

      // Traçado do G oficial
      ctx.fillStyle = color;
      const path = new Path2D("M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z");
      ctx.fill(path);
      const path2 = new Path2D("M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z");
      ctx.fill(path2);
      const path3 = new Path2D("M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z");
      ctx.fill(path3);
      const path4 = new Path2D("M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z");
      ctx.fill(path4);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.fillStyle = color;
      const path = new Path2D("M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9a8.16 8.16 0 0 0 4.77 1.52V7.06a4.85 4.85 0 0 1-1-.37z");
      ctx.fill(path);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9a8.16 8.16 0 0 0 4.77 1.52V7.06a4.85 4.85 0 0 1-1-.37z"/></svg>`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.fillStyle = color;
      const path = new Path2D("M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z");
      ctx.fill(path);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'social',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.fillStyle = color;
      const path = new Path2D("M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z");
      ctx.fill(path);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg>`
  },

  // PAGAMENTOS
  {
    id: 'pix',
    name: 'PIX (Banco Central)',
    category: 'payment',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Losango exterior entrelaçado do PIX
      ctx.beginPath();
      ctx.moveTo(12, 3);
      ctx.lineTo(21, 12);
      ctx.lineTo(12, 21);
      ctx.lineTo(3, 12);
      ctx.closePath();
      ctx.stroke();

      // Cruz estilizada interna
      ctx.beginPath();
      ctx.moveTo(12, 8);
      ctx.lineTo(12, 16);
      ctx.moveTo(8, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 10-9 10-9-10z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`
  },
  {
    id: 'credit-card',
    name: 'Cartão de Crédito',
    category: 'payment',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(2, 5, 20, 14, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2, 10);
      ctx.lineTo(22, 10);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillRect(5, 14, 4, 2);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
  },

  // CONTATO E LOCAL
  {
    id: 'wifi',
    name: 'Wi-Fi / Conexão',
    category: 'contact',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';

      // 3 arcos concêntricos
      ctx.beginPath();
      ctx.arc(12, 19, 13, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(12, 19, 8.5, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(12, 19, 4, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.stroke();

      // Ponto base
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(12, 19, 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`
  },
  {
    id: 'globe',
    name: 'Website / Link',
    category: 'contact',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.arc(12, 12, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(3, 12);
      ctx.lineTo(21, 12);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(12, 12, 5, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
  },
  {
    id: 'phone',
    name: 'Telefone',
    category: 'contact',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.arc(12, 12, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(12, 12, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
  },
  {
    id: 'map-pin',
    name: 'Localização / Endereço',
    category: 'contact',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.arc(12, 9, 6, -Math.PI * 0.9, -Math.PI * 0.1);
      ctx.lineTo(12, 21);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(12, 9, 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
  },
  {
    id: 'mail',
    name: 'E-mail / Envelope',
    category: 'contact',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(3, 5, 18, 14, 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(3, 7);
      ctx.lineTo(12, 13);
      ctx.lineTo(21, 7);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
  },

  // AVALIAÇÕES E SELOS
  {
    id: 'star-filled',
    name: 'Estrela Dourada / Avaliação',
    category: 'badges',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.fillStyle = color;
      ctx.beginPath();
      const rOuter = size * 0.48;
      const rInner = rOuter * 0.45;
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI / 5) - (Math.PI / 2);
        const innerAngle = outerAngle + (Math.PI / 5);
        if (i === 0) {
          ctx.moveTo(Math.cos(outerAngle) * rOuter, Math.sin(outerAngle) * rOuter);
        } else {
          ctx.lineTo(Math.cos(outerAngle) * rOuter, Math.sin(outerAngle) * rOuter);
        }
        ctx.lineTo(Math.cos(innerAngle) * rInner, Math.sin(innerAngle) * rInner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  },
  {
    id: 'verified',
    name: 'Selo de Verificado',
    category: 'badges',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x + size / 2, y + size / 2);
      ctx.fillStyle = color;

      // Círculo com pontas estilizadas de selo
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Checkmark branco interno
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = size * 0.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-size * 0.18, 0);
      ctx.lineTo(-size * 0.05, size * 0.14);
      ctx.lineTo(size * 0.2, -size * 0.14);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 2.05 3.65-.63 1.8 3.25 3.1 2.04-1.07 3.55 1.07 3.55-3.1 2.04-1.8 3.25-3.65-.63L12 22l-3.09-2.05-3.65.63-1.8-3.25-3.1-2.04 1.07-3.55-1.07-3.55 3.1-2.04 1.8-3.25 3.65.63L12 2z"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    id: 'heart',
    name: 'Coração / Amor',
    category: 'badges',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.fillStyle = color;
      ctx.beginPath();
      const path = new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
      ctx.fill(path);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  },
  {
    id: 'trophy',
    name: 'Troféu / Qualidade',
    category: 'badges',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(6, 4);
      ctx.lineTo(18, 4);
      ctx.lineTo(17, 11);
      ctx.arc(12, 11, 5, 0, Math.PI);
      ctx.lineTo(7, 11);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(12, 16);
      ctx.lineTo(12, 20);
      ctx.moveTo(8, 20);
      ctx.lineTo(16, 20);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`
  },

  // GERAL E SÍMBOLOS
  {
    id: 'sparkles',
    name: 'Brilho / Especial',
    category: 'general',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.fillStyle = color;
      const path = new Path2D("M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z");
      ctx.fill(path);
      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/></svg>`
  },
  {
    id: 'camera',
    name: 'Câmera / Aponte Aqui',
    category: 'general',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(3, 6, 18, 14, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(12, 13, 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(10, 3);
      ctx.lineTo(14, 3);
      ctx.lineTo(16, 6);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`
  },
  {
    id: 'shopping-bag',
    name: 'Sacola de Compras',
    category: 'general',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.roundRect(4, 7, 16, 14, 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(12, 7, 4, Math.PI, 0);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
  },
  {
    id: 'arrow-down',
    name: 'Seta Indicativa',
    category: 'general',
    viewBox: '0 0 24 24',
    draw: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      const s = size / 24;
      ctx.scale(s, s);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(12, 20);
      ctx.moveTo(6, 14);
      ctx.lineTo(12, 20);
      ctx.lineTo(18, 14);
      ctx.stroke();

      ctx.restore();
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`
  }
];

export function getIconById(id) {
  return ICONS_DATA.find(icon => icon.id === id) || ICONS_DATA[0];
}
