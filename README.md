# Estúdio de Placas 3D & Gerador de QR Code 🎨📐

Aplicação web moderna, interativa e profissional para criação e personalização de **placas de mesa em acrílico** (padrão **11 x 15 cm**) com visualização tridimensional fotorrealista em tempo real e exportação gráfica em alta resolução (**300 DPI / PDF escala 1:1**) pronta para impressão física, corte e colagem.

---

## ✨ Recursos Principais

### 1. Visualização 3D Interativa em Tempo Real
- **Renderização PBR de Acrílico**: Simulação física de acrílico cristal translúcido (`MeshPhysicalMaterial`, refração `ior: 1.491`, chanfros superiores e base de apoio horizontal em L de 55 mm).
- **Controles de Câmera**: Rotação suave em 360°, zoom milimétrico e movimentação com mouse ou toque na tela em dispositivos móveis.
- **Barra de Ferramentas Flutuante**: Presets de visão rápida (**Perspectiva 3D**, **Frontal**, **Lateral**), rotação automática contínua e reset instantâneo.
- **Alternador de Visão**: Troca fluida entre o **Modo 3D** e a **Prévia 2D de Impressão**.

### 2. Personalização Visual da Arte
- **Modo Avaliação Google**:
  - 5 estrelas decorativas no topo em amarelo oficial (`#FBBC05`).
  - Textos de cabeçalho e chamada de rodapé totalmente editáveis em tempo real.
  - Logotipo oficial Google renderizado com tipografia e cores originais.
  - Moldura de contorno arredondada estilizada em 4 cores do Google.
- **Modo Subir Arte Pronta**:
  - Arraste ou selecione qualquer imagem própria (PNG, JPG, WebP).
  - Ajuste automático de proporção na placa com opções de preenchimento (`Cover` ou `Contain`).

### 3. Gerador & Estilizador de QR Code Integrado
- **Controle Total de Conteúdo**: Insira o link da página do Google Meu Negócio, Instagram, WhatsApp, Cardápio ou Pix.
- **Módulos com Cantos Arredondados**: Estética visual moderna e suave nos pontos da matriz do código.
- **Logotipo Centralizado**:
  - Logotipo oficial do Google.
  - Upload de logotipo próprio (PNG com transparência).
  - Opção sem logotipo.
- **Correção de Erro de Nível Alto (H)**: Assegura 100% de escaneabilidade mesmo com imagem no meio ou cores customizadas.
- **Paleta de Cores Rápida**: Cores oficiais Google (Azul `#1a73e8`, Verde `#1e8e3e`, Vermelho `#d93025`, Amarelo `#f29900`), Preto Clássico ou qualquer cor hexadecimal.

### 4. Formato e Dimensões Físicas
- Medida padrão calibrada para o estoque físico do produtor: **11 cm de largura x 15 cm de altura** (110 x 150 mm) com **6 mm de espessura de acrílico** e **55 mm de base de apoio**.
- Campos para ajuste flexível de largura e altura com recálculo automático da geometria 3D e da proporção da arte.

### 5. Exportação Gráfica para Produção Física
- **Baixar PNG (300 DPI)**: Gera imagem em escala 1:1 na resolução gráfica de **1299 x 1772 pixels** (para 110 x 150 mm), sem perdas ou distorções.
- **Baixar PDF (Gráfica)**: Gera documento vetorial em PDF com dimensões físicas exatas de **110,0 x 150,0 mm**, compatível com CorelDraw, Illustrator, Photoshop e plotters de impressão.
- **Imprimir Direto**: Abre o assistente de impressão do navegador configurado para escala 100%.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado (v18+)

### Instalação e Inicialização
```powershell
# Instalar dependências
npm.cmd install

# Iniciar servidor de desenvolvimento local
npm.cmd run dev
```

Acesse no seu navegador: `http://localhost:5173/`

### Build para Produção
```powershell
npm.cmd run build
```
Os arquivos otimizados e prontos para hospedagem (Vercel, Netlify ou servidor próprio) serão gerados no diretório `dist/`.

---

## 📁 Estrutura do Projeto

```text
create-plaque/
├── index.html                  # Interface semântica e layout do estúdio
├── package.json                # Dependências (Three.js, qr-code-styling, jspdf, Vite)
├── vite.config.js              # Configuração do Vite
├── public/
│   ├── assets/
│   │   ├── google-logo.svg     # Logotipo oficial em vetor
│   │   ├── star.svg            # Estrela vetorial
│   │   └── google-wordmark.svg # Tipografia Google oficial
│   └── models/
│       └── suporte_acrilico-V2.obj # Geometria física do suporte acrílico
├── src/
│   ├── main.js                 # Inicialização da aplicação e amarração reativa
│   ├── style.css               # Design system dark glassmorphism e responsividade
│   ├── core/
│   │   ├── constants.js        # Dimensões e cores padrão de fabricação
│   │   └── state.js            # Gerenciador de estado reativo da placa
│   ├── qr/
│   │   └── qrGenerator.js      # Integração com qr-code-styling
│   ├── artwork/
│   │   ├── artworkRenderer.js  # Motor 2D de renderização da arte (Google & Upload)
│   │   └── templates.js        # Desenho de moldura, estrelas e marcas de corte
│   ├── viewer3d/
│   │   ├── sceneManager.js     # Three.js cena, iluminação PBR e órbita 360°
│   │   └── acrylicGeometry.js  # Malha paramétrica em L do acrílico translúcido
│   ├── export/
│   │   └── exportService.js    # Exportador de PNG 300 DPI e PDF escala real
│   └── ui/
│       ├── controlsManager.js  # Gestão de abas, formulários, presets e toggles
│       └── toast.js            # Sistema visual de feedback e notificações
└── specs/
    └── 001-placa-personalizada-3d/ # Documentação Spec-Kit completa
```
