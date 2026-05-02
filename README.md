# 📸 Photo AI Lab - Booth (Projeto ETEC)

Uma aplicação web interativa simulando uma **Cabine Fotográfica de Inteligência Artificial**. O projeto captura fotos via webcam (ou upload), remove o fundo original da pessoa usando IA em nuvem e aplica cenários temáticos instantaneamente, gerando um QR Code para que o usuário baixe a foto no celular.

## 🚀 Funcionalidades
- **Captura em Tempo Real:** Integração com a câmera do dispositivo do usuário.
- **Opção de Upload:** Permite anexar fotos já existentes caso o dispositivo não tenha câmera.
- **Processamento em Nuvem (Cloudinary):** Utiliza o Cloudinary para processamento assíncrono das imagens.
- **Remoção de Fundo por IA:** Usa o Add-on inteligente do Cloudinary (`e_background_removal`) para recortar a pessoa com precisão.
- **Filtros e Cenários (`underlays`):** Insere imagens estáticas atrás da pessoa recortada de forma econômica e super-rápida.
- **QR Code Instantâneo:** Gera automaticamente um código na tela para o usuário baixar a arte final pelo smartphone.

## 🛠️ Tecnologias Utilizadas
- **Frontend Padrão:** HTML5, CSS3 (Flexbox Moderno) e JavaScript (Vanilla).
- **Processamento de Imagem:** [Cloudinary API](https://cloudinary.com/) (Envio via REST API / Manipulação via URL).
- **Geração de QR Code:** Biblioteca open-source `qrcodejs`.

## ⚙️ Como Rodar o Projeto
Este projeto não necessita de banco de dados ou Node.js (backend) obrigatório para testes locais. Ele roda diretamente no navegador.

1. Clone ou baixe este repositório.
2. Abra o arquivo `index.html` em seu navegador (recomendamos usar extensões como o *Live Server* do VS Code para uma melhor experiência com a permissão de câmera).
3. Conceda permissão de uso da Câmera.

## 🔑 Configurando o Cloudinary (Para Desenvolvedores)
Para que os filtros e recortes funcionem, o projeto precisa de uma conta ativa no Cloudinary com as seguintes configurações:

1. **Ativar o Add-on de IA:** Vá em seu painel do Cloudinary > *Add-ons* > e ative o **Cloudinary AI Background Removal** (plano Free).
2. **Imagens de Fundo:** Faça o upload de imagens normais para o seu *Media Library* com os seguintes *Public IDs* exatos (ou altere no código fonte):
   - `fada_floresta`
   - `fundo_espaco`
3. **Variáveis no `script.js`:**
   Abra o arquivo `script.js` e preencha as duas variáveis principais no início do código com os dados da sua conta:
   ```javascript
   const CLOUD_NAME = "SEU_CLOUD_NAME";
   const UPLOAD_PRESET = "SEU_UPLOAD_PRESET"; // (Precisa ser "Unsigned")
   ```

## 📐 Estrutura do Código
O site é desenhado para centralizar tudo via Flexbox. Quando a foto é gerada e retornada pela API do Cloudinary, uma div oculta é ativada revelando a `urlFinalIA` (a foto processada) lado a lado com o QR Code.

---
*Desenvolvido como projeto educacional.*
