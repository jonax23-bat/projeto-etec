# 📺 Guia de Transmissão de Galeria e TV em Rede (PixelAI Booth)

Este documento contém o passo a passo completo para transmitir as fotos da cabine para **segundos monitores, TVs, telões ou outros computadores na rede local (cabeada ou Wi-Fi)** sem interferir no funcionamento da cabine de fotos.

---

## 📌 1. Modos de Operação Disponíveis

| Modo | O que faz | Como acessar |
| :--- | :--- | :--- |
| **Cabine Principal** | Tela de captura com câmera, contagem e temas para os convidados | `http://localhost:5000` |
| **PixelAI TV (Slideshow)** | Transmissão contínua em tela cheia das fotos salvas com QR Code no canto para download | `http://<IP_DO_PC>:5000/tv` |
| **Galeria Completa** | Grade de fotos para visualização, ampliação e download em outros PCs ou tablets | `http://<IP_DO_PC>:5000/galeria` |

---

## 🖥️ 2. Cenário A: Transmissão no Mesmo Computador (Monitor 2 / TV via HDMI)

Ideal quando você conecta um segundo monitor ou TV diretamente na placa de vídeo ou saída HDMI do computador da cabine.

### Passo a Passo:
1. Conecte a TV ou monitor secundário ao computador via cabo HDMI/DisplayPort.
2. No Windows, pressione as teclas **`Windows + P`** e selecione **"Estender"** (para ter duas telas independentes).
3. Na cabine de fotos:
   - Pressione a tecla **`9`** do teclado numérico para abrir o modal de galeria.
   - Pressione a tecla **`0`** do teclado numérico (ou clique no botão **`📺 TRANSMITIR (TV)`**).
4. Uma janela dedicada da **PixelAI TV** será aberta.
5. **Arraste essa janela para o monitor da TV** e aperte **`F`** ou **`F11`** para deixá-la em Tela Cheia.
6. Feche a galeria da tela principal apertando **`9`**. A cabine continua 100% livre para os convidados tirarem fotos!

---

## 🔌 3. Cenário B: Transmissão em Rede Cabeada (Ethernet) ou Wi-Fi

Ideal quando a TV ou outro computador de visualização fica longe da cabine (ex: telão de palco, recepção, totem de visualização).

### Passo 1: Conexão Física
- Conecte o **computador da cabine** e o **computador/Smart TV da transmissão** no mesmo roteador ou switch via cabo de rede RJ45 (ou na mesma rede Wi-Fi).

### Passo 2: Descobrir o IP do Computador da Cabine

1. No computador da cabine, abra o **Prompt de Comando (CMD)**:
   - Pressione no teclado as teclas **`Windows + R`**, digite **`cmd`** e aperte **`ENTER`**.
   - *(Ou digite `cmd` na barra de pesquisa do Windows)*.

2. Digite um dos comandos abaixo:

   **Opção A (Comando Padrão):**
   ```cmd
   ipconfig
   ```
   *Procure a linha **Endereço IPv4** (exemplo: `192.168.1.150` ou `192.168.0.25`).*

   **Opção B (Comando Rápido - mostra direto o IP sem poluição visual):**
   ```cmd
   ipconfig | findstr /i "IPv4"
   ```
   *Resultado direto no terminal:*
   ```text
   Endereço IPv4. . . . . . . .  : 192.168.1.150
   ```

3. Anote esse número de IP para digitar no navegador do outro computador ou Smart TV.

### Passo 3: Abrir a Transmissão no Outro Computador / Smart TV
1. No outro computador, notebook ou navegador da Smart TV, abra o Google Chrome, Edge ou navegador da TV.
2. Digite na barra de endereços:
   - **Para o Modo TV (Slideshow com QR Code):**
     ```text
     http://192.168.1.150:5000/tv
     ```
     *(Substitua `192.168.1.150` pelo IP real descoberto no Passo 2)*
   - **Para a Grade Completa de Fotos:**
     ```text
     http://192.168.1.150:5000/galeria
     ```
3. Clique em qualquer lugar da tela ou pressione a tecla **`F`** (ou `F11`) para colocar em **Tela Cheia**.

---

## ⚡ 4. Sincronização em Tempo Real

- **Automática:** O sistema sincroniza as fotos a cada 3 a 4 segundos.
- **Alerta de Nova Foto:** Sempre que um convidado tirar uma foto na cabine, a TV exibe automaticamente uma notificação animada **`✨ NOVA FOTO!`** e coloca a foto recente em destaque.
- **QR Code Integrado:** Cada slide na TV exibe no canto inferior um QR Code individual que permite aos convidados apontar a câmera do celular diretamente para a TV e baixar a foto.

---

## 🛡️ 5. Dica de Firewall do Windows (Caso não conecte de outro PC)

Se o outro computador não conseguir carregar a página na primeira tentativa:
1. No computador da cabine, abra o menu Iniciar e digite **"Permitir um aplicativo pelo Firewall do Windows"**.
2. Clique em **"Alterar configurações"**.
3. Localize **Python** na lista e certifique-se de que a caixa **"Privada"** esteja marcada.
4. Clique em **OK**.

---

## 🔢 6. Atalhos do Teclado Numérico na Cabine

| Tecla | Função |
| :---: | :--- |
| **`[ 1 ] a [ 8 ]`** | Escolha do tema/estilo de inteligência artificial |
| **`[ 1 ]`** | Trocar tema na tela de captura / Nova foto na tela final |
| **`[ 9 ]`** | Abrir / Fechar Galeria no painel da cabine |
| **`[ 0 ]`** | Iniciar Transmissão da TV |
| **`[ ENTER ]`** | Disparar contagem regressiva e captura da foto |
| **`[ F ]`** | Alternar modo Tela Cheia na página da TV |
