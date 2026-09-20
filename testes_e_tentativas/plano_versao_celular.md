# Transformação Mobile (PWA & Responsividade)

Este plano descreve as etapas para transformar o "Photo AI Lab" atual em um aplicativo completo para celular, melhorando a responsividade, adicionando o controle da câmera traseira e permitindo a instalação nativa via PWA.

## Resumo das Modificações Futuras

---

### UI & UX Responsivo (CSS)
- **Arquivo a modificar:** `stely.css`
- **Ação:** Adicionar regras de `@media (max-width: 600px)` para ajustar margens, tamanhos de fonte e o `flex-direction` da área de resultado para garantir que a foto e o QR Code caibam em telas estreitas sem cortar ou achatar.

---

### Funcionalidade "Virar Câmera" (HTML & JS)
- **Arquivo a modificar:** `index.html`
- **Ação:** Adicionar um novo botão de "🔄 Virar Câmera" logo abaixo do vídeo ou junto com os botões principais de controle.
- **Arquivo a modificar:** `script.js`
- **Ação:** Refatorar a chamada `navigator.mediaDevices.getUserMedia` para uma função que aceita alternar o parâmetro `facingMode` entre `user` (câmera frontal) e `environment` (câmera traseira).

---

### PWA - Progressive Web App (Manifest & Service Worker)
- **Novo Arquivo:** `img/app-icon.png`
- **Ação:** Gerar uma imagem 512x512 por IA para servir como ícone oficial do aplicativo.
- **Novo Arquivo:** `manifest.json`
- **Ação:** Criar o manifesto para o Chrome/Safari permitir a instalação ("Adicionar à Tela Inicial").
- **Novo Arquivo:** `sw.js`
- **Ação:** Criar um Service Worker leve apenas para habilitar a cache offline.
- **Arquivo a modificar:** `index.html`
- **Ação:** Adicionar as tags `<link rel="manifest" href="manifest.json">` e `<meta name="theme-color" content="#121212">`.
- **Arquivo a modificar:** `script.js`
- **Ação:** Registrar o Service Worker no carregamento do site.
