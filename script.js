const CLOUD_NAME = "dg668htg4";
const UPLOAD_PRESET = "preset-1";

const getEl = (id) => document.getElementById(id);

const video = getEl('video');
const canvas = getEl('canvas');
const ctx = canvas.getContext('2d');
const fileInput = getEl('fileInput');
const aiStyle = getEl('aiStyle');
const captureBtn = getEl('captureBtn');
const countdownEl = getEl('countdown');
const flash = getEl('flashOverlay');
const progressBar = getEl('progressBar');
const downloadBtn = getEl('downloadBtn');
const switchCameraBtn = getEl('switchCameraBtn');

let currentStream = null;
let currentFacingMode = 'user';

// --- GALERIA E SEGUNDA TELA ---
let galeria = JSON.parse(localStorage.getItem("pixelai_gallery")) || [];
let telaExterna = null;
let slideIndex = 0;
let slideInterval = null;

// --- NAVEGAÇÃO COM VALIDAÇÃO ---
getEl('startBtn').addEventListener('click', async () => {
    const landing = getEl('landingPage');
    const themeSelection = getEl('themeSelection');
    const startBtn = getEl('startBtn');

    if (landing && themeSelection) {
        startBtn.innerText = "VERIFICANDO...";
        startBtn.disabled = true;

        const apiAtiva = await validarCredenciaisCloudinary();

        if (apiAtiva) {
            landing.style.display = 'none';
            themeSelection.style.display = 'flex';
        } else {
            startBtn.innerText = "ERRO DE CONEXÃO";
            startBtn.style.background = "red";
            alert("Não foi possível conectar ao servidor. Verifique a internet.");
            startBtn.disabled = false;
        }
    }
});

async function validarCredenciaisCloudinary() {
    try {
        await fetch(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/sample.jpg`, { mode: 'no-cors' });
        return true; 
    } catch (e) { return false; }
}

function iniciarCamera() {
    if (!navigator.onLine) {
        exibirErroCamera("SEM CONEXÃO", "Internet necessária para a IA.");
        return;
    }

    // Esconde erro anterior
    const errDiv = getEl('cameraError');
    if(errDiv) errDiv.style.display = 'none';

    // Para a câmera atual antes de iniciar uma nova
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { 
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => { 
            currentStream = stream;
            if(video) video.srcObject = stream; 
            if(captureBtn) captureBtn.disabled = false;
        })
        .catch(err => {
            console.error("Erro ao acessar câmera:", err);
            exibirErroCamera("CÂMERA INDISPONÍVEL", "Verifique as permissões.");
        });
}

if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', () => {
        currentFacingMode = (currentFacingMode === 'user') ? 'environment' : 'user';
        iniciarCamera();
    });
}

function exibirErroCamera(titulo, mensagem) {
    if(captureBtn) captureBtn.disabled = true;
    const errDiv = getEl('cameraError');
    if(errDiv) {
        getEl('errTitle').innerText = titulo;
        getEl('errMsg').innerText = mensagem;
        errDiv.style.display = 'block';
    }
}

// --- CONTAGEM E FLASH ---
captureBtn.addEventListener('click', () => {
    let tempo = 3; 
    captureBtn.disabled = true;
    countdownEl.innerText = tempo;
    countdownEl.style.display = 'block';

    const intervalo = setInterval(() => {
        tempo--;
        if (tempo > 0) {
            countdownEl.innerText = tempo;
            countdownEl.style.transform = "translate(-50%, -50%) scale(1.2)";
            setTimeout(() => { countdownEl.style.transform = "translate(-50%, -50%) scale(1)"; }, 200);
        } else {
            clearInterval(intervalo);
            countdownEl.style.display = 'none';
            executarFlashECaptura();
        }
    }, 1000);
});

function executarFlashECaptura() {
    if(flash) {
        flash.classList.add('flash-animation');
        setTimeout(() => flash.classList.remove('flash-animation'), 500);
    }
    processarEEnviar(video);
}

// --- PROCESSAMENTO E DOWNLOAD ---
function animarBarra(alvo, tempo) {
    if(progressBar) {
        progressBar.style.width = alvo + "%";
        progressBar.style.transition = `width ${tempo}ms ease-in-out`;
    }
}

function processarEEnviar(fonte) {
    const MAX_WIDTH = 1280;
    let larguraOriginal = fonte.videoWidth || fonte.width;
    let alturaOriginal = fonte.videoHeight || fonte.height;
    let ratio = MAX_WIDTH / larguraOriginal;

    canvas.width = MAX_WIDTH;
    canvas.height = alturaOriginal * ratio;
    ctx.drawImage(fonte, 0, 0, canvas.width, canvas.height);
    
    getEl('captureStage').style.display = 'none';
    getEl('previewStage').style.display = 'grid';
    getEl('finalPreview').style.display = 'none'; 
    getEl('status').innerText = "🚀 IA processando...";
    if(downloadBtn) downloadBtn.style.display = 'none';
    
    if(progressBar) progressBar.parentElement.style.display = 'block';
    animarBarra(90, 3000); 

    enviarParaCloudinary(canvas.toDataURL('image/jpeg', 0.8));
}

function enviarParaCloudinary(base64Image) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', UPLOAD_PRESET);

    fetch(url, { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.secure_url) {
            const filtro = aiStyle.value;
            const partes = data.secure_url.split('/upload/');
            // Injeção de fl_attachment para forçar download
            const urlFinal = `${partes[0]}/upload/${filtro}/fl_attachment/${partes[1]}`;
            
            const imgPreview = getEl('finalPreview');
            imgPreview.onload = () => {
                animarBarra(100, 500);
                setTimeout(() => {
                    getEl('status').innerText = "✅ CONCLUÍDO!";
                    if(progressBar) progressBar.parentElement.style.display = 'none';
                    imgPreview.style.display = 'block';
                    
                    if(downloadBtn) {
                        downloadBtn.style.display = 'block';
                        downloadBtn.onclick = () => window.location.href = urlFinal;
                    }

                    getEl('qrcode').innerHTML = ""; 
                    new QRCode(getEl("qrcode"), { text: urlFinal, width: 150, height: 150 });
                }, 600);
            };
            imgPreview.src = urlFinal;

            // 🔥 SALVAR NA GALERIA
            salvarNaGaleria(urlFinal);
        }
    })
    .catch(() => { 
        getEl('status').innerText = "❌ ERRO"; 
        captureBtn.disabled = false;
    });
}

getEl('resetBtn').addEventListener('click', () => {
    getEl('previewStage').style.display = 'none';
    getEl('mainApp').style.display = 'none';
    getEl('themeSelection').style.display = 'flex';
    
    getEl('finalPreview').src = "";
    getEl('qrcode').innerHTML = "";
    if(downloadBtn) downloadBtn.style.display = 'none';
    if(progressBar) progressBar.style.width = "0%";
    
    // Para a câmera para economizar recursos enquanto escolhe novo tema
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
});

getEl('uploadBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => processarEEnviar(img);
            img.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

window.addEventListener('offline', () => location.reload());

// --- LOGICA DA GALERIA ---

function salvarNaGaleria(url) {
    // Adiciona ao início do array para as mais recentes virem primeiro
    galeria.unshift(url);
    // Limita a 20 fotos para não pesar o localStorage
    if (galeria.length > 20) galeria.pop();
    
    localStorage.setItem("pixelai_gallery", JSON.stringify(galeria));
    atualizarGaleria();
    enviarParaTelaExterna(url);
}

function limparGaleria() {
    if (confirm("Tem certeza que deseja apagar todas as fotos da galeria?")) {
        galeria = [];
        localStorage.removeItem("pixelai_gallery");
        atualizarGaleria();
        
        // Se a tela externa estiver aberta, limpa o slide
        if (telaExterna && !telaExterna.closed) {
            const img = telaExterna.document.getElementById("slide");
            if (img) img.src = "";
        }
    }
}

function atualizarGaleria() {
    const galeriaDiv = getEl("galeria");
    const section = getEl("gallerySection");
    
    if (!galeriaDiv || galeria.length === 0) {
        if(section) section.style.display = 'none';
        return;
    }

    if(section) section.style.display = 'block';
    galeriaDiv.innerHTML = "";

    galeria.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Foto da Galeria";
        img.onclick = () => {
            getEl('captureStage').style.display = 'none';
            getEl('previewStage').style.display = 'grid';
            getEl('finalPreview').src = url;
            getEl('finalPreview').style.display = 'block';
            getEl('status').innerText = "✅ VENDO GALERIA";
            if(downloadBtn) {
                downloadBtn.style.display = 'block';
                downloadBtn.onclick = () => window.location.href = url;
            }
            getEl('qrcode').innerHTML = ""; 
            new QRCode(getEl("qrcode"), { text: url, width: 150, height: 150 });
        };
        galeriaDiv.appendChild(img);
    });
}

// --- LOGICA SEGUNDA TELA (TV) ---

getEl("openTvBtn").addEventListener("click", () => {
    if (telaExterna && !telaExterna.closed) {
        telaExterna.focus();
        return;
    }

    telaExterna = window.open("", "PixelAITV", "width=1280,height=720");
    
    telaExterna.document.write(`
        <html>
        <head>
            <title>PixelAI - Transmissão</title>
            <style>
                body { 
                    margin: 0; background: #000; 
                    display: flex; align-items: center; justify-content: center; 
                    overflow: hidden; font-family: 'Orbitron', sans-serif;
                }
                #slide { 
                    max-width: 100%; max-height: 100vh; 
                    box-shadow: 0 0 50px rgba(0, 212, 255, 0.5);
                    border: 5px solid #00d4ff;
                    transition: opacity 1s ease-in-out;
                    border-radius: 20px;
                }
                .logo {
                    position: absolute; bottom: 30px; right: 30px;
                    width: 150px; opacity: 0.7;
                }
            </style>
        </head>
        <body>
            <img id="slide" src="${galeria[0] || ''}">
            <img src="img/logo.png" class="logo">
        </body>
        </html>
    `);

    iniciarSlideshow();
});

function iniciarSlideshow() {
    if (slideInterval) clearInterval(slideInterval);
    
    slideInterval = setInterval(() => {
        if (!telaExterna || telaExterna.closed || galeria.length === 0) return;

        const img = telaExterna.document.getElementById("slide");
        if (!img) return;

        slideIndex = (slideIndex + 1) % galeria.length;
        
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = galeria[slideIndex];
            img.style.opacity = '1';
        }, 1000);

    }, 5000); // 5 segundos por foto
}

function enviarParaTelaExterna(url) {
    if (!telaExterna || telaExterna.closed) return;

    const img = telaExterna.document.getElementById("slide");
    if (img) {
        img.src = url;
        slideIndex = 0; // Reseta para a mais nova
    }
}

// Inicializa galeria ao carregar
window.addEventListener('load', atualizarGaleria);

// Botão Limpar
getEl("clearGalleryBtn").addEventListener("click", limparGaleria);

// --- LOGICA DE TEMAS ---

function selectTheme(valor, nomeAmigavel) {
    if(aiStyle) aiStyle.value = valor;
    const tag = getEl('currentThemeTag');
    if(tag) tag.querySelector('span').innerText = nomeAmigavel.toUpperCase();
    
    getEl('themeSelection').style.display = 'none';
    getEl('mainApp').style.display = 'flex';
    iniciarCamera();
}

getEl('changeThemeBtn').addEventListener('click', () => {
    getEl('mainApp').style.display = 'none';
    getEl('themeSelection').style.display = 'flex';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
});

// --- ATALHOS DE TECLADO ---
window.addEventListener('keydown', (e) => {
    const themeSelection = getEl('themeSelection');
    if (themeSelection && themeSelection.style.display !== 'none') {
        switch (e.key) {
            case '1': selectTheme('e_cartoonify', 'Estilo Disco'); break;
            case '2': selectTheme('e_oil_paint', 'Pintura a Óleo'); break;
            case '3': selectTheme('e_art:incognito', 'Filtro Mistério'); break;
            case '4': selectTheme('e_background_removal/u_fundo_espaco,c_scale,w_1.0,h_1.0,fl_relative/fl_layer_apply', 'Espaço Sideral'); break;
            case '5': selectTheme('e_background_removal/u_fada_floresta,c_scale,w_1.0,h_1.0,fl_relative/fl_layer_apply', 'Floresta Encantada'); break;
            case '6': selectTheme('e_improve', 'Teste 6'); break;
            case '7': selectTheme('e_improve', 'Teste 7'); break;
            case '8': selectTheme('e_improve', 'Teste 8'); break;
        }
    }
});