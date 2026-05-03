# Photo AI Lab - PixelAI Booth 🚀

Este projeto é uma cabine de fotos futurista baseada em Inteligência Artificial, desenvolvida para proporcionar uma experiência imersiva de captura e transformação de imagens em tempo real.

## 🌟 Principais Funcionalidades (v9.0)

### 📸 Experiência de Captura e Seleção
- **Seleção Visual de Temas**: Interface dedicada com cards interativos (Disco, Royalty, Vegas, Alien, Floresta) para escolha do estilo antes da captura.
- **Atalhos de Teclado (1-8)**: Seleção ultra-rápida de temas através do teclado numérico, ideal para totens de eventos.
- **Sistema de Estágios**: Fluxo dinâmico: Landing -> Seleção de Temas -> Captura -> Resultado.
- **Contagem Regressiva e Flash**: Temporizador de 3s e feedback visual de disparo.

### 🖼️ Galeria & Transmissão (Modo Evento)
- **Galeria Persistente**: Seção dedicada que armazena localmente as fotos da sessão via `localStorage`, permitindo rever QRCodes e baixar fotos anteriores.
- **Transmissão para Segunda Tela (TV)**: Botão dedicado que abre uma janela de slideshow em tempo real, perfeita para projetar as fotos em monitores externos ou telões com transições de fade.
- **Gestão de Galeria**: Botão de limpeza rápida para resetar a sessão entre grupos de usuários.

### 🎨 Design & IA (Cloudinary)
- **Neon Experience**: Borda e pulso neon em todos os elementos interativos (cards, botões, badges), mudando de cor conforme a ação.
- **Estética Assimétrica**: Design moderno com bordas irregulares (`40px 10px 40px 10px`) e glassmorphism.
- **Processamento IA**: Remoção de fundo e aplicação de filtros complexos via Cloudinary.

### 📱 Otimização Mobile
- **Responsividade Inteligente**: A galeria e os controles de transmissão são ocultados automaticamente em celulares para uma interface de captura simplificada e limpa.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend de Imagem**: Cloudinary API (IA & CDN).
- **Bibliotecas**: QRCode.js para geração de códigos.

---

### Como Rodar o Projeto
1. Certifique-se de que as variáveis `CLOUD_NAME` e `UPLOAD_PRESET` no `script.js` estão configuradas.
2. Abra o `index.html` em um servidor local (Live Server recomendado).
3. Use as teclas **1 a 8** para testar a seleção rápida de temas na tela de estilos.

*Desenvolvido para apresentações e feiras de tecnologia (ETEC).*

---

## 🚀 Próximos Passos (Roadmap v10.0)
- [ ] **Filtros de Vídeo**: Implementar gravação de mini-clipes (Boomerang) com IA.
- [ ] **Integração Social**: Envio direto para redes sociais ou e-mail.
- [ ] **Analytics**: Contador de fotos tiradas por tema para estatísticas de evento.
