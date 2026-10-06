# Implementation Plan: Sistema de Placas Personalizadas com Visualização 3D e Gerador de QR Code

**Branch**: `001-placa-personalizada-3d` | **Date**: 2026-10-05 | **Spec**: [spec.md](file:///c:/Users/esau0/Downloads/create-plaque/specs/001-placa-personalizada-3d/spec.md)

**Input**: Feature specification from `specs/001-placa-personalizada-3d/spec.md`

## Summary

Construção de uma aplicação web interativa ("Estúdio de Criação de Placas") que permite ao usuário projetar, customizar e visualizar em 3D realista placas de mesa em acrílico (com medidas padrão de 11 x 15 cm em formato L). A solução integra:
1. Um gerador e personalizador de QR Code dinâmico com cantos arredondados, logotipo central e cores (baseado nas melhores práticas do projeto de referência `qrcode-custom.vercel.app`).
2. Um motor de composição de arte 2D em tempo real com modo template "Google Avaliações" e modo upload de arte livre.
3. Um visualizador tridimensional (Three.js) com materiais PBR que simulam acrílico translúcido e projetam a arte diretamente na peça física com controles de órbita 360°, zoom e ângulos de câmera.
4. Exportação direta no cliente de arquivos em alta definição (300 DPI em PNG e PDF vetorial na escala física de 110 x 150 mm) prontos para impressão gráfica, corte e colagem no suporte acrílico.

---

## Technical Context

**Language/Version**: JavaScript (ES Modules, modern standards) / HTML5 / CSS3  
**Primary Dependencies**:
- `three` (WebGL 3D Rendering, OrbitControls, MeshPhysicalMaterial para acrílico)
- `qr-code-styling` (Motor de estilização e renderização vetorial/canvas de QR Code)
- `jspdf` (Geração de PDFs milimétricos em escala 1:1 sem distorção)
- `vite` (Servidor de desenvolvimento ultrarrápido e bundler leve)

**Storage**: Local storage no navegador para persistência do último estado de placa (opcional / offline); sem necessidade de banco de dados no lançamento inicial (execução 100% client-side sem dependência de backend).  
**Testing**: Testes manuais guiados por cenários em `quickstart.md`, validação de fidelidade dimensional dos arquivos exportados (300 DPI e 110 x 150 mm) e leitura instantânea de QR Code por smartphone.  
**Target Platform**: Navegadores Web modernos (desktop e mobile: Chrome, Edge, Firefox, Safari) com aceleração WebGL.  
**Project Type**: Web Application (Single-Page Application de alto impacto visual e alta performance gráfica).  
**Performance Goals**:
- Renderização 3D a 60 fps constante.
- Latência de sincronização da arte com a textura 3D < 50ms.
- Tempo de carregamento inicial da aplicação < 1.5s.
- Geração e download do PNG 300 DPI em < 800ms.

**Constraints**:
- Execução 100% no navegador (sem necessidade de servidor backend para gerar o QR code ou renderizar a imagem).
- Proporção física fiel à chapa e ao suporte de acrílico real (`suporte_acrilico-V2.obj`, 110 x 150 mm).
- Aderência estrita às diretrizes visuais premium (dark theme, glassmorphism, tipografia Outfit/Inter, micro-interações fluidas).

**Scale/Scope**: Ferramenta completa de design, visualização tridimensional e saída gráfica pronta para uso imediato em produção e atendimento a clientes.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio de Simplicidade e Autonomia**: A solução opera integralmente no cliente via WebGL e Canvas API, eliminando pontos únicos de falha de rede ou backend para a confecção da arte.
- **Fidelidade Dimensional**: As medidas físicas no arquivo PDF e na textura 3D obedecem às dimensões nominais de 110 x 150 mm definidas pelo usuário para o suporte acrílico em estoque.
- **Validação de Leitura de QR Code**: Nível de correção de erro de alta tolerância (nível H ou Q) assegura legibilidade impecável mesmo com sobreposição de logotipos ou cores customizadas.

Status: **APROVADO (Sem violações)**.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-placa-personalizada-3d/
├── spec.md              # Especificação de requisitos e histórias de usuário
├── plan.md              # Este plano de implementação
├── research.md          # Pesquisa técnica e decisões de arquitetura
├── data-model.md        # Modelagem de dados e entidades
├── contracts/
│   └── editor-contract.md # Interfaces de QR Code, 3D Viewer, Canvas e Exportação
├── quickstart.md        # Roteiro de inicialização e validação ponta a ponta
└── checklists/
    └── requirements.md  # Checklist de conformidade e qualidade
```

### Source Code (repository root)

```text
create-plaque/
├── index.html                  # Estrutura semântica principal e layout do estúdio
├── package.json                # Dependências (three, qr-code-styling, jspdf, vite)
├── vite.config.js              # Configuração do Vite
├── public/
│   ├── assets/
│   │   ├── google-logo.svg     # Logotipo oficial em vetor para o QR Code e título
│   │   └── star.svg            # Estrela em vetor para o cabeçalho de avaliação
│   └── models/
│       └── suporte_acrilico-V2.obj # Geometria de referência do suporte acrílico
├── src/
│   ├── main.js                 # Inicialização da aplicação e amarração de módulos
│   ├── style.css               # Design system, layout em estúdio, tema dark glassmorphism
│   ├── core/
│   │   ├── constants.js        # Cores padrão (Google, acrílico), medidas físicas default
│   │   └── state.js            # Gerenciador de estado reativo da placa
│   ├── qr/
│   │   └── qrGenerator.js      # Integração com qr-code-styling e logos
│   ├── artwork/
│   │   ├── artworkRenderer.js  # Motor 2D de composição da placa (Google Review & Arte Livre)
│   │   └── templates.js        # Definição dos templates de layout e proporções
│   ├── viewer3d/
│   │   ├── sceneManager.js     # Setup Three.js, cena, luzes, câmera e controles de órbita
│   │   └── acrylicGeometry.js  # Geração e ajuste paramétrico do suporte em L em acrílico
│   ├── export/
│   │   └── exportService.js    # Exportador de PNG 300 DPI e PDF nas medidas milimétricas reais
│   └── ui/
│       ├── controlsManager.js  # Controle de inputs, toggles, abas e seleção de cor/logo
│       └── toast.js            # Notificações visuais elegantes ao usuário
```

---

## Complexity Tracking

Nenhuma violação aos princípios do projeto. Arquitetura modular, limpa e de fácil manutenção.
