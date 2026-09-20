# 🚀 Guia de Inicialização e Instalação da Cabine PixelAI

Este documento detalha o passo a passo para **iniciar a cabine** e como **instalar ou corrigir o rembg e as dependências de IA diretamente na máquina** usando o comando `python -m pip`.

---

## ⚡ 1. Como Iniciar a Cabine (Uso no Dia a Dia)

### Método 1: Pelo Atalho ou Arquivo `.bat` (Mais Fácil)
1. Dê **dois cliques** no arquivo **`iniciar_cabine.bat`** na pasta do projeto.
2. O script irá:
   - Verificar automaticamente o Python e as bibliotecas de IA (`rembg`, `Flask`, etc.).
   - Iniciar o servidor de IA local (`server.py`).
   - Abrir o navegador automaticamente em `http://localhost:5000`.
3. Para colocar o navegador em **Tela Cheia** na cabine, aperte **`F11`**.

### Método 2: Pelo Terminal (Manual)
1. Abra o **Prompt de Comando (CMD)** na pasta do projeto.
2. Digite:
   ```cmd
   python server.py
   ```
3. Abra o navegador no endereço:
   👉 **`http://localhost:5000`**

---

## 🛠️ 2. Correção e Instalação do `rembg` via `python -m pip`

Se o comando `pip` sozinho não for reconhecido pelo Windows ou der erro de caminho, **sempre use o prefixo `python -m`**. Isso força o Windows a usar o módulo `pip` diretamente instalado no executável do Python da sua máquina.

### Passo a Passo de Instalação Manual e Forçada:

Abra o **Prompt de Comando (CMD)** como Administrador e execute a sequência abaixo:

### Passo 1: Garantir que o Pip existe e está ativo
```cmd
python -m ensurepip --default-pip
```

### Passo 2: Atualizar o Pip
```cmd
python -m pip install --upgrade pip
```

### Passo 3: Instalar o `rembg` (com suporte otimizado a CPU)
```cmd
python -m pip install "rembg[cpu]"
```

### Passo 4: Instalar as demais bibliotecas do servidor
```cmd
python -m pip install onnxruntime opencv-python-headless flask flask-cors Pillow requests numpy
```

*(Ou instale tudo de uma vez pelo arquivo de requisitos):*
```cmd
python -m pip install -r requirements.txt
```

---

## 🧪 3. Como Testar se o `rembg` está Funcionando

No Prompt de Comando, digite o seguinte comando para testar a importação:

```cmd
python -c "import rembg; print('rembg instalado com sucesso! Versao:', rembg.__version__)"
```

Se aparecer a mensagem **`rembg instalado com sucesso!`**, o seu ambiente de IA está 100% pronto.

---

## 🔢 4. Atalhos da Cabine (Teclado Numérico)

| Tecla | Função |
| :---: | :--- |
| **`[ ENTER ]`** | Disparar foto / Iniciar contagem regressiva |
| **`[ 1 ] a [ 8 ]`** | Escolher tema/estilo de IA |
| **`[ 1 ]`** | Trocar tema / Nova foto |
| **`[ 9 ]`** | Abrir / Fechar Galeria no painel da cabine |
| **`[ 0 ]`** | Transmitir Slideshow para a TV |
| **`[ F11 ]`** | Modo Tela Cheia no navegador |
