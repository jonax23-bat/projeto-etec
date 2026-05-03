# Photo AI Lab - PixelAI Booth 🚀

Este projeto é uma cabine de fotos futurista baseada em Inteligência Artificial, desenvolvida para proporcionar uma experiência imersiva de captura e transformação de imagens em tempo real.

## 🌟 Principais Funcionalidades (v8.0)

### 📸 Experiência de Captura Profissional
- **Sistema de Estágios**: Fluxo dinâmico que separa a tela de **Captura** da tela de **Resultado**, mantendo a interface limpa e focada.
- **Contagem Regressiva**: Temporizador visual de 3 segundos para que o usuário se posicione antes do disparo.
- **Efeito de Flash**: Simulação visual de flash fotográfico para feedback instantâneo.
- **Trava de Segurança**: O botão de captura permanece bloqueado até que uma câmera válida seja detectada, evitando erros de hardware.

### 🎨 Inteligência Artificial (Cloudinary)
- **Recorte Preciso**: Integração com IA para remoção automática de fundo.
- **Cenários Dinâmicos**: Aplicação de cenários como *Espaço Sideral* e *Floresta Encantada* via camadas de sobreposição.
- **Filtros Artísticos**: Estilos de Cartoon, Pintura a Óleo e Filtros de Mistério aplicados via transformações de URL.

### 🛠️ UX & Performance
- **Barra de Progresso Real-Time**: Feedback visual animado enquanto a IA processa a imagem.
- **QR Code Dinâmico**: Geração automática de código para download imediato da foto no celular.
- **Botão de Download**: Link direto otimizado para salvar a arte final no dispositivo.
- **Validação de API**: O sistema verifica a conectividade com o servidor antes de iniciar a experiência.

## 💎 Design System Premium

- **Estética Assimétrica**: Layout moderno com bordas irregulares (`border-radius` variado) que quebram o padrão quadrado convencional.
- **Brilho Neon Split**: Card principal envolto em uma aura de luz roxa e azul que pulsa suavemente, reforçando a identidade tecnológica.
- **Identidade Visual**: Logo centralizado em destaque (150px) e cabeçalho minimalista.
- **Responsividade Vertical**: Proporção 4:5 otimizada para fotos de retrato, ideal para apresentações em totens ou telas verticais.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **Backend de Imagem**: Cloudinary API (IA & CDN).
- **Bibliotecas**: QRCode.js para geração de códigos.

---

### Como Rodar o Projeto
1. Clone o repositório.
2. Certifique-se de que as variáveis `CLOUD_NAME` e `UPLOAD_PRESET` no `script.js` estão configuradas.
3. Abra o `index.html` em um servidor local (recomendado usar a extensão *Live Server* ou `python -m http.server`).

*Desenvolvido para apresentações e feiras de tecnologia (ETEC).*
