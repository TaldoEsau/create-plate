# Interface Contracts: Sistema de Placas Personalizadas com Visualização 3D e Gerador de QR Code

**Feature**: `001-placa-personalizada-3d` | **Date**: 2026-10-05

## 1. QRCodeGeneratorContract

Responsável por gerar a matriz gráfica estilizada do QR Code com cantos arredondados, cor e logotipo central.

```typescript
export interface QRCodeGeneratorContract {
  /**
   * Gera o elemento canvas contendo o QR Code estilizado de acordo com a configuração informada.
   */
  generateQRCode(config: QRCodeConfig): Promise<HTMLCanvasElement>;
  
  /**
   * Valida se a URL ou conteúdo informado é viável e possui tamanho adequado para densidade de leitura.
   */
  validateContent(content: string): { valid: boolean; warning?: string };
}
```

---

## 2. ArtworkRendererContract

Responsável por compor visualmente a arte da placa (template do Google com estrelas, moldura, textos e QR Code, ou arte enviada pelo usuário).

```typescript
export interface RenderOptions {
  widthPx: number;
  heightPx: number;
  dpi: number;
  includeCropMarks?: boolean;
}

export interface ArtworkRendererContract {
  /**
   * Renderiza a arte completa no canvas com a resolução desejada (prévia ou 300 DPI para impressão).
   */
  renderArtwork(
    artwork: ArtworkConfig,
    qrCanvas: HTMLCanvasElement | null,
    dimension: PlaqueDimension,
    options: RenderOptions
  ): Promise<HTMLCanvasElement>;
}
```

---

## 3. Plaque3DViewerContract

Controla o ciclo de vida do renderizador Three.js, cena tridimensional, malha do acrílico, iluminação física e atualização de textura.

```typescript
export interface Plaque3DViewerContract {
  /**
   * Inicializa o renderizador WebGL, luzes e controles no container DOM.
   */
  init(container: HTMLElement): void;

  /**
   * Atualiza a geometria da placa acrílica se as dimensões físicas forem alteradas.
   */
  setDimensions(dimension: PlaqueDimension): void;

  /**
   * Aplica dinamicamente a textura gerada pelo ArtworkRenderer na face frontal da placa.
   */
  updateArtworkTexture(artworkCanvas: HTMLCanvasElement): void;

  /**
   * Ajusta o enquadramento da câmera para ângulos predefinidos (ex: frontal, perspectiva 3D, lateral).
   */
  setCameraAngle(angle: 'perspective' | 'front' | 'side' | 'top'): void;

  /**
   * Redimensiona o viewport quando a janela do navegador mudar de tamanho.
   */
  resize(): void;

  /**
   * Libera recursos de GPU e listeners ao desmontar o componente.
   */
  dispose(): void;
}
```

---

## 4. ExportServiceContract

Executa o empacotamento para produção gráfica (PNG 300 DPI e PDF nas medidas físicas exatas).

```typescript
export interface ExportServiceContract {
  /**
   * Realiza o download da imagem em PNG em escala 1:1 a 300 DPI.
   */
  downloadPNG(masterCanvas: HTMLCanvasElement, filename?: string): void;

  /**
   * Gera e dispara o download do PDF com as dimensões milimétricas reais da placa (ex: 110 x 150 mm).
   */
  downloadPDF(masterCanvas: HTMLCanvasElement, dimension: PlaqueDimension, filename?: string): Promise<void>;

  /**
   * Abre o assistente de impressão do navegador em página configurada para escala 100%.
   */
  triggerPrint(masterCanvas: HTMLCanvasElement, dimension: PlaqueDimension): void;
}
```
