# Quickstart & Validation Guide: Sistema de Placas Personalizadas com Visualização 3D

**Feature**: `001-placa-personalizada-3d` | **Date**: 2026-10-05

## Prerequisites

- **Node.js**: Versão 18+ (instalada: v24.11.1)
- **Navegador**: Qualquer navegador moderno com suporte a WebGL 2.0 (Google Chrome, Microsoft Edge, Mozilla Firefox ou Safari)
- **Terminal Shell**: PowerShell ou Bash (executando comandos com `npm.cmd` no Windows)

---

## 1. Instalação e Execução Local

```powershell
# 1. Instalar as dependências do projeto
npm.cmd install

# 2. Iniciar o servidor de desenvolvimento
npm.cmd run dev
```

Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## 2. Roteiro de Validação Ponta a Ponta

### Cenário 1: Personalização Interativa do Modelo Google Avaliações
1. Abra a aplicação no navegador.
2. No campo **Link das Avaliações**, insira uma URL de teste (ex: `https://g.page/r/sua-empresa`).
3. No seletor de **Logo Central**, alterne entre **Google**, **Sua Imagem** e **Sem Logo**.
4. Modifique a cor do QR Code utilizando os botões de paleta rápida ou o seletor hexadecimal.
5. **Resultado esperado**:
   - O QR Code se regenera com os módulos arredondados e a logo escolhida.
   - O canvas da arte 2D reflete as mudanças sem atraso.
   - A face da placa no visualizador 3D é atualizada em tempo real (< 100ms).

### Cenário 2: Manipulação e Realismo Tridimensional (3D)
1. Clique com o botão esquerdo no visualizador 3D e arraste para orbitar o suporte de acrílico em 360°.
2. Utilize a roda do mouse (ou pinça no trackpad/tela sensível) para aproximar (zoom) e afastar.
3. Teste os botões de visão rápida: **Perspectiva**, **Frontal**, **Lateral**.
4. **Resultado esperado**:
   - O suporte translúcido em formato L exibe reflexos e chanfros nos cantos superiores.
   - A base horizontal de apoio fica plana e visível sob todos os ângulos.
   - A arte adesivada permanece nítida na face frontal do modelo 3D.

### Cenário 3: Modo Upload de Arte Pronta
1. Alterne para o modo **Subir Arte Pronta**.
2. Arraste ou selecione um arquivo de imagem próprio (PNG ou JPG).
3. **Resultado esperado**:
   - A arte externa substitui o template padrão do Google e se ajusta à proporção da placa (11 x 15 cm).
   - O modelo 3D reflete imediatamente a imagem enviada na face da placa.

### Cenário 4: Exportação em Alta Resolução (300 DPI e PDF)
1. Com a placa personalizada, clique no botão **Baixar PNG (300 DPI)**.
   - Verifique que o arquivo baixado possui ~1299 x 1772 pixels (proporção exata de 11 x 15 cm a 300 DPI).
2. Clique no botão **Baixar PDF (Gráfica)**.
   - Abra o PDF e confira nas propriedades do documento que o tamanho da página é exatamente **110,0 x 150,0 mm**.
3. Aponte a câmera do seu celular para o QR Code no arquivo gerado:
   - O link configurado deve ser lido e aberto instantaneamente.
