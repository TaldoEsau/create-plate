# Technical Research: Sistema de Placas Personalizadas com Visualização 3D e Gerador de QR Code

**Feature**: `001-placa-personalizada-3d` | **Date**: 2026-10-05

## Context & Objectives

Construir uma aplicação web moderna, fluida e com visual premium para criação de placas de acrílico de mesa personalizadas (com medida padrão de 11 x 15 cm baseada no modelo `suporte_acrilico-V2.obj`), permitindo personalização em tempo real de artes com gerador de QR Code customizado, renderização tridimensional interativa (3D) da peça e exportação direta em alta resolução (300 DPI, PDF e PNG) pronta para impressão gráfica e corte.

---

## 1. Engine de Visualização 3D e Materialidade Acrílica

### Decisão
Utilizar **Three.js** com `OrbitControls` e `MeshPhysicalMaterial` para renderizar o suporte acrílico e a arte em tempo real.

### Racional
- **Three.js** é a biblioteca WebGL mais robusta, performática e amplamente suportada em navegadores desktop e mobile.
- `MeshPhysicalMaterial` oferece propriedades físicas reais (PBR) ideais para acrílico transparente:
  - `transmission`: 0.92 ~ 0.98 (transparência óptica com refração)
  - `roughness`: 0.05 ~ 0.1 (superfície polida lisa)
  - `ior`: 1.491 (Índice de refração exato do polimetilmetacrilato / acrílico)
  - `thickness`: 4.0 ~ 6.0 mm (profundidade volumétrica da peça)
  - `clearcoat`: 1.0 (brilho especular característico de plástico vítreo)
- A arte personalizada é aplicada como `CanvasTexture` gerada dinamicamente pelo pipeline 2D na face frontal do suporte.
- O modelo físico fornecido em `suporte_acrilico-V2.obj` serve como geometria de referência: criaremos um gerador paramétrico de geometria ou carregador do OBJ que escala dinamicamente para as medidas da placa (110 mm de largura x 150 mm de altura) com cantos chanfrados e base de apoio em L idêntica à peça física real.

### Alternativas Consideradas
- **Babylon.js**: Excelente engine, porém com bundle significativamente mais pesado para um visualizador de produto único.
- **Model-viewer Web Component**: Mais engessado para sincronizar texturas dinâmicas em alta resolução a 60 fps em tempo real.
- **Canvas 2D Isométrico / Pseudo-3D**: Rejeitado pois não fornece órbita 360°, rotação suave nem realismo de transparência e profundidade física.

---

## 2. Geração e Estilização de QR Code em Tempo Real

### Decisão
Utilizar a biblioteca **`qr-code-styling`** no frontend para renderização vetorial e rasterizada do QR Code customizado.

### Racional
- `qr-code-styling` é a mesma base conceitual e tecnológica das ferramentas mais avançadas de QR Code moderno, oferecendo nativamente:
  - **Módulos com cantos arredondados** (`dotsOptions.type = 'rounded' | 'dots' | 'classy'`).
  - **Cores personalizadas e gradientes** para os módulos e marcadores de canto.
  - **Logotipo centralizado** com preservação da margem e correção de erro configurada (nível H ou Q) para garantir 100% de escaneabilidade mesmo com imagem no meio.
  - **Fundo transparente** ou sólido configurável.
  - **Exportação direta** para Canvas ou imagem PNG de alta resolução.
- Opera 100% no cliente sem dependência de APIs externas de terceiros, garantindo velocidade imediata e funcionamento contínuo.

### Alternativas Consideradas
- **qrcode (npm)**: Gera apenas QR Codes clássicos com matriz quadrada pura e preta, exigindo manipulação manual pixel-a-pixel para arredondamento de cantos e inserção de logo.
- **API Externa de QR Code (ex: QuickChart / Google Chart)**: Rejeitado por introduzir latência de rede, requisições HTTP a cada digitação e risco de indisponibilidade externa.

---

## 3. Pipeline de Composição Gráfica da Arte e Exportação 300 DPI

### Decisão
Arquitetura de renderização com **Dual-Canvas (Prévia Rápida + Master de Alta Resolução)**:
1. **Canvas de Prévia / Textura 3D**: Resolução balanceada (~800 x 1090 px) que atualiza instantaneamente a textura no Three.js a 60 fps.
2. **Canvas Master de Impressão (300 DPI)**: Resolução física milimétrica exata para 11 x 15 cm:
   $$\text{Largura} = \frac{110\text{ mm}}{25.4} \times 300\text{ DPI} \approx 1299\text{ px}$$
   $$\text{Altura} = \frac{150\text{ mm}}{25.4} \times 300\text{ DPI} \approx 1772\text{ px}$$
   Com margem de segurança e guias de corte leves opcionais.

### Racional
- Garante separação de preocupações: a edição na tela é leve e ultrarrápida, enquanto o download gera um arquivo gráfico com qualidade de gráfica offset / impressora fotográfica profissional.
- O editor desenha:
  - Fundo branco fosco / brilhante
  - 5 estrelas amarelas (`#FBBC05`) com contorno refinado
  - Título ("Nos avalie no") com logotipo Google colorido oficial
  - Moldura de contorno arredondada estilizada em 4 cores Google (Amarelo `#FBBC05`, Vermelho `#EA4335`, Azul `#4285F4`, Verde `#34A853`)
  - O QR Code gerado pelo motor estilizado centralizado
  - Chamada para ação inferior ("APONTE A CÂMERA E AVALIE!")
  - Ou, no caso de "Upload de Arte Livre", a imagem carregada pelo usuário ajustada à proporção exata da placa com suporte a rotação e preenchimento.

---

## 4. Exportação para PDF Vetorial / Escala 1:1

### Decisão
Utilizar **`jspdf`** para gerar documentos PDF com medidas milimétricas explícitas (`unit: 'mm'`, formato `[110, 150]`), inserindo a imagem de 300 DPI sem compressão com perdas.

### Racional
- O arquivo PDF gerado abre em softwares de corte e impressão (CorelDraw, Illustrator, Photoshop, Acrobat) já nas dimensões exatas de 11,0 cm x 15,0 cm, sem que o operador da impressora precise redimensionar manualmente.
- Permite que o usuário imprima diretamente do navegador com proporção de 100% (sem ajuste de escala que deforme o tamanho).

---

## 5. Estrutura e Interface do Usuário (Design & UX)

### Decisão
Interface em estilo **Estúdio Criativo (Studio Workspace)** com layout responsivo dividido em:
- **Painel de Controle Esquerdo (Editor)**:
  - Seletor de modo (Modelo Google Avaliações vs. Subir Arte Pronta)
  - Configuração do QR Code (Link, Logo Central [Google / Upload / Nenhum], Cor, Cantos)
  - Personalização de textos e chamadas
  - Dimensões da placa (11 x 15 cm padrão, com campos para customização)
- **Área Central / Direita (Visualizador 3D + Prévia 2D)**:
  - Viewport 3D imersivo com controles de órbita, zoom, iluminação e reset de visão
  - Alternador rápido para prévia 2D da arte impressa com régua milimétrica
  - Barra de ações de saída: Botão de **Baixar em PNG (300 DPI)** e **Baixar em PDF (Gráfica)**
- **Estética Visual**:
  - Tema dark moderno e luxuoso (superfícies em acrílico escuro fosco, glassmorphism, tipografia Outfit/Inter, acentos de iluminação ciano/azul elétrico e toques de acabamento de alta precisão).
