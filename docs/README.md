# Photo AI Lab - PixelAI Booth 🚀

[![Version](https://img.shields.io/badge/version-10.0-cyan.svg)](https://github.com/jonax23-bat/projeto-etec)
[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/jonax23-bat/projeto-etec)
[![Python](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

Cabine fotográfica futurista baseada em Inteligência Artificial, projetada para totens de eventos, feiras de tecnologia (ETEC) e experiências imersivas de captura e transformação de imagens em tempo real.

---

## 🌟 Principais Funcionalidades (v10.0)

### 📸 1. Fluxo de Experiência Imersivo
- **Estágios Dinâmicos**: Transição suave entre *Landing Page* ➔ *Seleção de Temas* ➔ *Captura com Câmera* ➔ *Processando com IA* ➔ *Resultado Final*.
- **Contagem Regressiva & Flash**: Temporizador de 3 segundos com animação e efeito de flash na tela.
- **Áudio & Feedback Visual**: Sons para início, contagem e disparo fotográfico.
- **Suporte Multi-Câmeras**: Alternância entre câmera frontal e traseira em dispositivos móveis e totens.

### 🎨 2. 8 Temas Exclusivos com Atalhos Numéricos
Seleção instantânea via cards visuais ou teclado numérico:
1. **[ 1 ] Disco** – Efeitos retrô de pista de dança e luzes neon
2. **[ 2 ] Royalty** – Moldura e fundo nobre com estética dourada
3. **[ 3 ] Vegas** – Cassino iluminado e luzes vibrantes
4. **[ 4 ] Alien / Cyberpunk** – Visual futurista tecnológico
5. **[ 5 ] Floresta Mágica** – Natureza encantada com iluminação mágica
6. **[ 6 ] Minimalist** – Estilo contemporâneo e clean
7. **[ 7 ] Anos 80 / Synthwave** – Estética retrô-futurista com grid e gradientes
8. **[ 8 ] Infantil / Cartoon** – Cenário colorido e divertido

### ⚡ 3. Processamento Híbrido de IA (Online & Offline)
- **Modo Nuvem (Cloudinary)**: Remoção de fundo e fusão com templates de fundo na nuvem com geração rápida de URL e QR Code.
- **Modo Servidor Local Offline (`server.py`)**:
  - Motor de remoção de fundo com IA local via **`rembg`** (`u2net` / ONNX Runtime).
  - Fusão e renderização de composição com imagens locais de alta resolução.
  - Funcionamento 100% autônomo, sem dependência de internet durante o evento.

### 📺 4. Transmissão para Telão / TV em Tempo Real (`tv.html`)
- Slideshow dinâmico projetado para segunda tela ou telão na rede local.
- Atualização em tempo real via **BroadcastChannel** (janela local) e sincronização via servidor LAN.
- Exibição de **QR Code individual** flutuante em cada foto para que os participantes baixem direto no smartphone.

### 🖼️ 5. Galeria de Evento Integrada (`galeria.html` e Modal)
- Armazenamento em `localStorage` e persistência local (`gallery_data.json`).
- Modal de zoom com download direto da imagem em alta resolução.
- Função de limpeza rápida com confirmação de segurança para troca de turmas/sessões.

### 📱 6. PWA & Responsividade Total
- Suporte a instalação como Web App (PWA) via `manifest.json` e `sw.js`.
- Layout responsivo adaptado para celular, tablet e totens verticais ou horizontais com **Full Screen (`F11`)**.

---

## ⌨️ Atalhos da Cabine (Totem / Teclado)

| Tecla | Ação |
| :---: | :--- |
| **`[ 1 ]` a `[ 8 ]`** | Selecionar tema/estilo correspondente |
| **`[ ENTER ]` ou `[ ESPAÇO ]`** | Disparar foto / Iniciar contagem |
| **`[ 9 ]` ou `[ G ]`** | Abrir / Fechar Galeria |
| **`[ 0 ]` ou `[ T ]`** | Abrir Transmissão para TV / Telão |
| **`[ R ]`** | Reiniciar / Nova foto |
| **`[ ESC ]`** | Fechar modais / Voltar ao início |
| **`[ F11 ]`** | Alternar modo Tela Cheia |

---

## 🚀 Como Iniciar

### Opção 1: Inicialização Automática (Recomendado no Windows)
Dê dois cliques no arquivo **`iniciar_cabine.bat`**.  
O script iniciará o servidor local e abrirá o navegador automaticamente em `http://localhost:5000`.

### Opção 2: Linha de Comando (Python)
1. Instale as dependências:
   ```bash
   python -m pip install -r requirements.txt
   ```
2. Inicie o servidor:
   ```bash
   python server.py
   ```
3. Acesse no navegador:
   👉 **`http://localhost:5000`**

---

## 📂 Estrutura do Projeto

```text
projeto-etec/
├── index.html                  # Interface principal da Cabine (Totem)
├── script.js                   # Lógica da câmera, IA, atalhos e galeria
├── stely.css                   # Design futurista neon e estilos responsivos
├── tv.html                     # Tela de transmissão/slideshow para TV/Telão
├── galeria.html                # Página de galeria do evento
├── server.py                   # Servidor Python Flask (IA Offline & LAN)
├── sw.js                       # Service Worker para PWA
├── manifest.json               # Configurações do PWA
├── requirements.txt            # Dependências Python (rembg, Flask, etc.)
├── iniciar_cabine.bat          # Inicializador rápido de 1-clique
├── setup_pixelai.bat           # Script de configuração do ambiente
├── inno_setup_installer.iss    # Script de build para instalador .exe
├── img/                        # Assets visuais e fundos dos temas
└── docs/                       # Guias e documentação de suporte
    ├── GUIA_INICIAR_CABINE.md
    └── GUIA_TRANSMISSAO_TV_REDE.md
```

---

## 👥 Autores & Créditos
Desenvolvido para apresentações e feiras de tecnologia da **ETEC**.

- **Jonas C. Santos**
- **Agatha Engelmann**
- **Gabriel Souza**
