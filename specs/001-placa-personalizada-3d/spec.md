# Feature Specification: Sistema de Placas Personalizadas com Visualização 3D e Gerador de QR Code

**Feature Branch**: `001-placa-personalizada-3d`

**Created**: 2026-10-05

**Status**: Ready for Planning

**Input**: User description: "vamos fazer um sistema de criar placa personalizada. a pessoa escolhera o formato da placa e as dimensoes, com isso ela podera subir uma arte e ver como ficara a placa dela. como pode ver um exemplo da imagem, ela podera subir a imagem ja pronta ou mudar em tempo real. o modelo ira aparecer em 3D para visualizacao. ira gerar o QRCODE e podera personaliza-lo tambem, use o mesmo que fiz aqui nesse site meu https://qrcode-custom.vercel.app, nele é possivel criar e personalizar um QRCODE. esse sistema é para as pessoas fazer a personalizacao da sua plaquinha, com isso eu irei ver e fazer a impresao da imagem e colar na plaquinha 3D. atualmente minhas plaquinhas medem 11 x 15. no arq suporte_acrilico-V2.obj é um que eu fiz para o modelo da placa, edite como for necessario. faca um desing bom e intuitivo para o usuario"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalização Visual da Arte e QR Code Customizado (Priority: P1)

Como cliente ou lojista, desejo personalizar a arte da minha placa de mesa (editando textos, estrelas, cores, logotipo e o QR Code em tempo real, ou subindo uma arte própria completa) para que eu possa criar um display de balcão exatamente com a identidade e propósito do meu negócio.

**Why this priority**: É o valor primário da aplicação. Sem a capacidade de customizar ou enviar a arte com QR Code funcional e atraente, o produto final não pode ser concebido.

**Independent Test**: Pode ser testado de forma autônoma inserindo dados de um QR Code, customizando suas cores/logo e editando campos de texto (ou enviando um arquivo de imagem próprio), verificando a atualização instantânea do design 2D gerado.

**Acceptance Scenarios**:

1. **Given** que o usuário está no editor de placa, **When** ele digita um link de destino, escolhe a cor do QR Code, ativa cantos arredondados e seleciona um logotipo central (Google, logotipo próprio enviado ou sem logotipo), **Then** o QR Code é gerado e atualizado instantaneamente na composição da placa.
2. **Given** que o usuário possui uma arte finalizada externamente, **When** ele seleciona a opção "Subir Arte Pronta" e faz upload de um arquivo de imagem (PNG/JPG), **Then** o sistema exibe essa arte diretamente sobre a placa, respeitando a proporção da área útil.
3. **Given** o modelo padrão de "Avaliação Google", **When** o usuário altera os textos de cabeçalho ("Nos avalie no Google"), instruções de rodapé ("APONTE A CÂMERA E AVALIE!") ou cores da moldura, **Then** as alterações refletem imediatamente na prévia da arte.

---

### User Story 2 - Visualização Tridimensional (3D) Interativa da Placa Acrílica (Priority: P1)

Como cliente, desejo visualizar a minha placa personalizada aplicada em um modelo 3D realista do suporte acrílico com liberdade para rotacionar, inclinar e aproximar a peça, para que eu tenha certeza visual de como o produto físico final ficará antes da confecção.

**Why this priority**: A visualização 3D proporciona a experiência de produto premium ("o que você vê é o que você recebe"), reduzindo incertezas do cliente e valorizando a apresentação do mostruário físico de acrílico.

**Independent Test**: Pode ser testado carregando o modelo tridimensional do suporte acrílico e aplicando texturas de arte dinâmicas, validando a resposta dos controles de câmera (órbita 360°, zoom, inclinação) e a fidelidade da perspectiva.

**Acceptance Scenarios**:

1. **Given** uma arte configurada no editor 2D, **When** a cena 3D é renderizada, **Then** o modelo exibe o suporte acrílico com sua geometria (base de apoio e painel inclinado) e a arte estampada na face frontal com iluminação e reflexos condizentes com acrílico.
2. **Given** a exibição 3D em tela, **When** o usuário arrasta o cursor do mouse ou desliza o dedo na tela em dispositivos móveis, **Then** o modelo 3D rotaciona suavemente em todos os ângulos para visualização completa da peça.
3. **Given** o modelo 3D em exibição, **When** o usuário altera qualquer elemento da arte no editor, **Then** a textura do suporte 3D é sincronizada em tempo real sem necessidade de recarregar a página.

---

### User Story 3 - Configuração de Formato e Dimensões da Placa (Priority: P2)

Como usuário, desejo selecionar o formato do display e visualizar as dimensões físicas da placa (tendo como medida padrão o suporte em L vertical de 11 x 15 cm com ajuste flexível de dimensões), para que o modelo 3D e a área da arte correspondam precisamente às medidas do acrílico que será cortado e colado.

**Why this priority**: Garante consistência dimensional entre o que é projetado no ambiente digital e a peça física em acrílico que o produtor possui em estoque.

**Independent Test**: Pode ser testado ajustando dimensões de largura e altura e verificando se tanto a proporção do suporte 3D quanto a proporção do canvas de arte adaptam suas dimensões em conformidade.

**Acceptance Scenarios**:

1. **Given** a seleção de dimensões, **When** o usuário mantém a opção padrão de 11 x 15 cm, **Then** o suporte 3D adota as proporções exatas de 11 cm de largura por 15 cm de altura com a base em L correspondente ao arquivo de suporte físico.
2. **Given** a necessidade de ajustar a escala da placa, **When** novas dimensões válidas de largura e altura são informadas, **Then** a malha tridimensional e a área de trabalho da arte recalculam suas proporções preservando a margem de segurança de corte.

---

### User Story 4 - Exportação da Arte Pronta para Impressão e Produção Física (Priority: P1)

Como produtor/administrador da confecção de placas ou cliente final, desejo exportar e baixar a arte finalizada em resolução profissional (300 DPI, nos formatos PDF e PNG) nas medidas exatas da placa (11 x 15 cm) com guias de corte, para que a imagem possa ser impressa, recortada e colada perfeitamente no suporte de acrílico 3D.

**Why this priority**: É a etapa final de entrega de valor comercial do sistema: transformar o pedido e o design digital em um arquivo pronto para gráfica/impressora física sem perda de nitidez ou distorção de escala.

**Independent Test**: Pode ser testado gerando o arquivo para impressão a partir de uma arte personalizada e validando se o documento possui 300 DPI, dimensões exatas de 11 x 15 cm e se o QR Code impresso é escaneado instantaneamente por um leitor de código de barras/câmera.

**Acceptance Scenarios**:

1. **Given** uma personalização concluída, **When** o usuário aciona os botões de download, **Then** o sistema gera o download direto de arquivo PNG em alta resolução (300 DPI) e/ou PDF com medidas milimétricas fiéis a 11 x 15 cm.
2. **Given** a arte impressa resultante, **When** a câmera de um smartphone é apontada para o QR Code impresso na placa física, **Then** a leitura ocorre com sucesso e rapidez, direcionando para o endereço configurado.

---

### Edge Cases

- **Upload de imagens com baixa resolução**: Quando o usuário envia uma imagem com menos de 150 DPI para a área de 11 x 15 cm, o sistema deve exibir um aviso amigável alertando sobre possível perda de nitidez na impressão final.
- **Links muito extensos no QR Code**: Ao inserir URLs com dezenas de parâmetros de rastreamento, o sistema deve ajustar o nível de correção de erro de forma a preservar legibilidade visual sem comprometer a leitura rápida.
- **Dispositivos sem aceleração gráfica WebGL**: Caso o navegador ou dispositivo do usuário não consiga inicializar o contexto 3D, o sistema deve fornecer automaticamente um modo de visualização 2D de alta fidelidade como fallback suave.
- **Textos longos ou quebras de linha no modelo em tempo real**: Textos extensos nos campos de título e instruções devem sofrer autoajuste de tamanho de fonte ou aviso de limite de caracteres para não sobrepor o QR Code ou sair da borda da placa.
- **Cores de QR Code sem contraste suficiente**: Se o usuário selecionar uma cor clara de QR Code sobre fundo claro, o sistema deve sugerir ou alertar para utilizar cores com alto contraste garantindo a leitura por câmeras.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a seleção do formato e das medidas da placa, tendo como configuração padrão o suporte de mesa em L de 11 cm de largura por 15 cm de altura.
- **FR-002**: O sistema DEVE disponibilizar duas opções de alimentação da arte: (a) Editor em tempo real com modelo pronto customizável; (b) Upload de arte gráfica já pronta enviada pelo usuário nos formatos PNG, JPG ou WebP.
- **FR-003**: O sistema DEVE fornecer um modelo de arte pré-configurado para avaliações (estilo Google Avaliações), contendo 5 estrelas decorativas, texto de cabeçalho personalizável, moldura externa colorida (nas cores clássicas do Google ou personalizáveis) e frase inferior de chamada para ação.
- **FR-004**: O sistema DEVE integrar um gerador e customizador de QR Code dinâmico permitindo definir: link de destino, cores dos módulos, cantos arredondados, fundo transparente ou branco, e inclusão de logotipo centralizado (logotipo oficial Google, logotipo enviado pelo usuário ou sem logotipo).
- **FR-005**: O sistema DEVE exibir um visualizador tridimensional (3D) interativo em tempo real, renderizando o suporte acrílico com a arte personalizada mapeada diretamente em sua face frontal.
- **FR-006**: A cena 3D DEVE suportar controles intuitivos de manipulação de câmera (órbita 360°, controle de zoom e inclinação) e apresentar materialidade translúcida com brilho característico de acrílico.
- **FR-007**: O sistema DEVE sincronizar imediatamente qualquer alteração feita no editor (textos, imagens, cores ou QR Code) com a textura da placa no visualizador 3D.
- **FR-008**: O sistema DEVE gerar e disponibilizar para download direto arquivos de produção em alta qualidade (resolução de 300 DPI nas medidas exatas da placa, padrão 11 x 15 cm, nos formatos PNG e PDF).
- **FR-009**: O sistema DEVE possibilitar o download imediato e direto dos arquivos finais para impressão (PDF/PNG em 300 DPI) para que o cliente ou produtor envie e utilize conforme preferir.
- **FR-010**: O sistema DEVE focar no suporte acrílico formato L vertical de 11 x 15 cm (baseado na geometria física do arquivo `suporte_acrilico-V2.obj`), disponibilizando campos de ajuste flexível de dimensões para adaptação caso necessário.
- **FR-011**: O editor DEVE contemplar o template pronto "Google Avaliações" e o modo "Upload de Arte Livre", mantendo a interface limpa, ágil e focada na experiência do usuário.

### Key Entities

- **Modelo de Placa (PlaqueModel)**: Representa a peça física de acrílico (geometria 3D, largura em cm, altura em cm, espessura do acrílico, inclinação da base e tipo de suporte em L).
- **Composição da Arte (ArtworkComposition)**: Define os elementos visuais aplicados à placa (modo arte pronta ou modo template Google Avaliações, elementos de texto, tipografia, cores, estrelas, moldura e imagem enviada).
- **Configuração do QR Code (QRCodeConfig)**: Parâmetros do código bidimensional (conteúdo da URL, cor dos módulos, formato dos cantos, modo de fundo e logotipo central embutido).
- **Pacote de Produção (ProductionExport)**: Documento de saída em escala 1:1 contendo a arte rasterizada a 300 DPI, margens de segurança, guias de alinhamento e opções de download em PDF e PNG.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O cliente consegue personalizar sua placa completa (textos, QR Code e visualização 3D) e realizar o download dos arquivos em menos de 3 minutos.
- **SC-002**: Toda alteração no editor (digitação de texto, alteração de cor, envio de logo) reflete na renderização 3D em tempo real com resposta imediata (latência inferior a 100 milissegundos).
- **SC-003**: 100% dos QR Codes impressos a partir dos arquivos gerados pelo sistema são reconhecidos e escaneados com sucesso por smartphones comuns em até 2 segundos.
- **SC-004**: Os arquivos de exportação mantêm precisão dimensional de 11 x 15 cm com tolerância inferior a 1 mm e densidade mínima de 300 DPI, garantindo padrão gráfico profissional para impressão direta.
- **SC-005**: A interface do visualizador e configurador obtém taxa de conclusão de personalização superior a 90% na primeira sessão de uso sem necessidade de instruções externas ou tutoriais em vídeo.

## Assumptions

- A placa padrão de produção física é feita em acrílico com formato em L e medidas nominais de 11 cm (largura) x 15 cm (altura), correspondendo à geometria de referência em `suporte_acrilico-V2.obj`.
- A arte personalizada será impressa em papel fotográfico autoadesivo ou vinil adesivo em alta resolução e colada manualmente sobre a superfície acrílica.
- A experiência de personalização e visualização 3D funciona diretamente no navegador web de dispositivos móveis e desktops, dispensando instalação de softwares adicionais.
- Os modelos de QR Code aproveitam as funcionalidades já validadas no projeto de referência do usuário (`qrcode-custom.vercel.app`), com cantos arredondados, logotipo central e cores estilizadas.
- O fluxo de entrega dos arquivos é via download direto pelo próprio navegador em alta resolução (PDF e PNG).
