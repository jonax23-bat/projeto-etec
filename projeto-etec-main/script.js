const CLOUD_NAME = "dg668htg4";
const UPLOAD_PRESET = "preset-1";

const getEl = (id) => document.getElementById(id);

const video = getEl('video');
const canvas = getEl('canvas');
const ctx = canvas.getContext('2d');
const fileInput = getEl('fileInput');
const captureBtn = getEl('captureBtn');
const countdownEl = getEl('countdown');
const flash = getEl('flashOverlay');
const downloadBtn = getEl('downloadBtn');
const progressBar = getEl('progressBar');

let currentStream = null;
let currentFacingMode = 'user';
let selectedFilter = 'fada_floresta.jpg'; // filtro padrão
let currentScreen = 'landing'; // 'landing', 'theme', 'main_capture', 'main_preview'
let cameraRotation = 0; // 0, 90, 180, 270
let selectedDeviceId = null;

// --- GALERIA E SEGUNDA TELA ---
let galeria = JSON.parse(localStorage.getItem("pixelai_gallery")) || [];
let telaExterna = null;
let slideIndex = 0;
let slideInterval = null;

// --- VERIFICAÇÃO DE STATUS DO SERVIDOR LOCAL ---
function checkServerStatus() {
    fetch('http://localhost:5000/health')
        .then(res => res.json())
        .then(data => {
            const light = document.querySelector('.status-light');
            if (light) light.className = 'status-light green';
            const text = getEl('statusText');
            if (text) text.innerText = 'SERVIDOR ONLINE';
            const startBtn = getEl('startBtn');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerText = "INICIAR EXPERIÊNCIA";
            }
        })
        .catch(() => {
            const light = document.querySelector('.status-light');
            if (light) light.className = 'status-light red';
            const text = getEl('statusText');
            if (text) text.innerText = 'SERVIDOR OFFLINE';
            const startBtn = getEl('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerText = "AGUARDANDO SERVIDOR...";
            }
        });
}

setInterval(checkServerStatus, 3000);
checkServerStatus();

// --- NAVEGAÇÃO COM VALIDAÇÃO ---
if (getEl('startBtn')) {
    getEl('startBtn').addEventListener('click', () => {
        currentScreen = 'theme';
        const landing = getEl('landingPage');
        const themeSelection = getEl('themeSelection');

        if (landing && themeSelection) {
            landing.style.display = 'none';
            themeSelection.style.display = 'flex';
        }
    });
}

// --- CÂMERA ---
async function iniciarCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const cameraError = getEl('cameraError');
    if (cameraError) cameraError.style.display = 'none';
    if (captureBtn) captureBtn.disabled = true;

    try {
        const constraints = {
            video: {
                facingMode: currentFacingMode,
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';

        video.onloadedmetadata = () => {
            if (captureBtn) captureBtn.disabled = false;
        };
    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        if (cameraError) {
            cameraError.style.display = 'block';
            const errTitle = getEl('errTitle');
            const errMsg = getEl('errMsg');
            if (errTitle) errTitle.innerText = "CÂMERA NÃO ENCONTRADA";
            if (errMsg) errMsg.innerText = "Verifique as permissões do navegador ou conecte uma webcam.";
        }
    }
}

// Alternar câmera frontal/traseira
const switchCameraBtn = getEl('switchCameraBtn');
if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        iniciarCamera();
    });
}

// --- FLUXO DE CAPTURA COM CONTAGEM ---
if (captureBtn) {
    captureBtn.addEventListener('click', () => {
        if (captureBtn.disabled) return;
        captureBtn.disabled = true;

        let count = 3;
        if (countdownEl) {
            countdownEl.innerText = count;
            countdownEl.style.display = 'block';
        }

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                if (countdownEl) countdownEl.innerText = count;
            } else {
                clearInterval(timer);
                if (countdownEl) countdownEl.style.display = 'none';
                dispararFlash();
                capturarFoto();
            }
        }, 1000);
    });
}

function dispararFlash() {
    if (flash) {
        flash.style.display = 'block';
        flash.classList.add('flash-animation');
        setTimeout(() => {
            flash.style.display = 'none';
            flash.classList.remove('flash-animation');
        }, 500);
    }
}

function capturarFoto() {
    prepararTelaProcessamento();

    let larguraOriginal = video.videoWidth || 1280;
    let alturaOriginal = video.videoHeight || 720;

    if (cameraRotation === 90 || cameraRotation === 270) {
        canvas.width = alturaOriginal;
        canvas.height = larguraOriginal;
    } else {
        canvas.width = larguraOriginal;
        canvas.height = alturaOriginal;
    }

    ctx.save();
    if (cameraRotation === 90) {
        ctx.translate(canvas.width, 0);
        ctx.rotate(90 * Math.PI / 180);
    } else if (cameraRotation === 180) {
        ctx.translate(canvas.width, canvas.height);
        ctx.rotate(180 * Math.PI / 180);
    } else if (cameraRotation === 270) {
        ctx.translate(0, canvas.height);
        ctx.rotate(270 * Math.PI / 180);
    }
    
    ctx.drawImage(video, 0, 0, larguraOriginal, alturaOriginal);
    ctx.restore();

    enviarParaServidor(canvas.toDataURL('image/jpeg', 0.95));
}

// --- PROCESSAMENTO E DOWNLOAD ---
function animarBarra(alvo, tempo) {
    if (progressBar) {
        progressBar.style.width = alvo + "%";
        progressBar.style.transition = `width ${tempo}ms ease-in-out`;
    }
}

function prepararTelaProcessamento() {
    currentScreen = 'main_preview';
    getEl('captureStage').style.display = 'none';
    getEl('previewStage').style.display = 'grid';
    getEl('finalPreview').style.display = 'none'; 
    getEl('status').innerText = "🚀 IA processando foto...";
    if (downloadBtn) downloadBtn.style.display = 'none';
    
    if (progressBar && progressBar.parentElement) {
        progressBar.parentElement.style.display = 'block';
    }
    animarBarra(90, 2500); 
}

function enviarParaServidor(base64Image) {
    const url = 'http://localhost:5000/process';
    const payload = {
        image: base64Image,
        theme: selectedFilter,
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET
    };

    fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
    })
    .then(r => r.json())
    .then(data => tratarRespostaServidor(data))
    .catch(err => {
        console.error("Erro na requisição ao servidor:", err);
        getEl('status').innerText = "❌ ERRO DE CONEXÃO COM O SERVIDOR";
        if (captureBtn) captureBtn.disabled = false;
    });
}

function tratarRespostaServidor(data) {
    if (data.secure_url || data.image_base64) {
        let urlFinal = data.secure_url || data.image_base64;
        
        // Se for Cloudinary, gerar link de download direto
        if (data.secure_url && data.secure_url.includes('/upload/')) {
            const partes = data.secure_url.split('/upload/');
            urlFinal = `${partes[0]}/upload/fl_attachment/${partes[1]}`;
        }

        const imgPreview = getEl('finalPreview');
        imgPreview.onload = () => {
            animarBarra(100, 400);
            setTimeout(() => {
                getEl('status').innerText = "✅ CONCLUÍDO!";
                if (progressBar && progressBar.parentElement) {
                    progressBar.parentElement.style.display = 'none';
                }
                imgPreview.style.display = 'block';

                if (downloadBtn) {
                    downloadBtn.style.display = 'block';
                    downloadBtn.onclick = () => window.location.href = urlFinal;
                }

                getEl('qrcode').innerHTML = ""; 
                new QRCode(getEl("qrcode"), { text: urlFinal, width: 150, height: 150 });
            }, 300);
        };
        imgPreview.src = urlFinal;
        salvarNaGaleria(urlFinal);
        enviarParaTelaExterna(urlFinal);
    } else if (data.error) {
        getEl('status').innerText = "❌ ERRO: " + data.error; 
        if (captureBtn) captureBtn.disabled = false;
    }
}

// Reset / Nova Foto
if (getEl('resetBtn')) {
    getEl('resetBtn').addEventListener('click', () => {
        currentScreen = 'theme';
        getEl('previewStage').style.display = 'none';
        getEl('mainApp').style.display = 'none';
        getEl('themeSelection').style.display = 'flex';
        
        getEl('finalPreview').src = "";
        getEl('qrcode').innerHTML = "";
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (progressBar) progressBar.style.width = "0%";
        
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
    });
}

// Anexar imagem por arquivo (Fallback)
if (getEl('uploadBtn') && fileInput) {
    getEl('uploadBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    prepararTelaProcessamento();
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    enviarParaServidor(canvas.toDataURL('image/jpeg', 0.95));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
            e.target.value = '';
        }
    });
}

window.addEventListener('offline', () => location.reload());

// --- LÓGICA DA GALERIA ---

function salvarNaGaleria(url) {
    galeria.unshift(url);
    if (galeria.length > 50) galeria.pop();
    
    localStorage.setItem("pixelai_gallery", JSON.stringify(galeria));
    atualizarGaleria();
    
    fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    }).catch(err => console.warn("Aviso: Falha ao sincronizar foto na rede:", err));
}

function abrirModalGaleria() {
    atualizarGaleria();
    const modal = getEl("galleryModal");
    if (modal) modal.style.display = "flex";
}

function fecharModalGaleria() {
    const modal = getEl("galleryModal");
    if (modal) modal.style.display = "none";
}

function limparGaleria() {
    if (confirm("Tem certeza que deseja apagar todas as fotos da galeria?")) {
        galeria = [];
        localStorage.removeItem("pixelai_gallery");
        atualizarGaleria();
        fetch('/api/gallery', { method: 'DELETE' }).catch(() => {});
    }
}

function atualizarGaleria() {
    const galeriaDiv = getEl("galeriaGrid");
    const emptyMsg = getEl("emptyGalleryMsg");
    if (!galeriaDiv) return;

    galeriaDiv.innerHTML = "";

    if (galeria.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    galeria.forEach((url, idx) => {
        const item = document.createElement("div");
        item.className = "gallery-card-item";
        
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Foto ${idx + 1}`;
        img.loading = "lazy";

        const overlay = document.createElement("div");
        overlay.className = "gallery-item-overlay";
        overlay.innerHTML = `<span>🔍 VER &amp; QR CODE</span>`;

        item.appendChild(img);
        item.appendChild(overlay);

        item.onclick = () => {
            fecharModalGaleria();
            getEl('captureStage').style.display = 'none';
            getEl('previewStage').style.display = 'flex';
            currentScreen = 'main_preview';
            
            getEl('finalPreview').src = url;
            getEl('finalPreview').style.display = 'block';
            getEl('status').innerText = "✅ VISUALIZANDO FOTO DA GALERIA";
            if (downloadBtn) {
                downloadBtn.style.display = 'block';
                downloadBtn.onclick = () => window.location.href = url;
            }
            getEl('qrcode').innerHTML = ""; 
            new QRCode(getEl("qrcode"), { text: url, width: 150, height: 150 });
        };
        galeriaDiv.appendChild(item);
    });
}

// Botões da Galeria
if (getEl("openGalleryModalBtn")) {
    getEl("openGalleryModalBtn").addEventListener("click", abrirModalGaleria);
}
if (getEl("closeGalleryModalBtn")) {
    getEl("closeGalleryModalBtn").addEventListener("click", fecharModalGaleria);
}
if (getEl("clearGalleryBtn")) {
    getEl("clearGalleryBtn").addEventListener("click", limparGaleria);
}

const galleryModalEl = getEl("galleryModal");
if (galleryModalEl) {
    galleryModalEl.addEventListener("click", (e) => {
        if (e.target === galleryModalEl) {
            fecharModalGaleria();
        }
    });
}

// --- LÓGICA SEGUNDA TELA (TV) ---

if (getEl("openTvBtn")) {
    getEl("openTvBtn").addEventListener("click", () => {
        if (telaExterna && !telaExterna.closed) {
            telaExterna.focus();
            return;
        }
        telaExterna = window.open("tv.html", "PixelAITV", "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no");
    });
}

function enviarParaTelaExterna(url) {
    if (!telaExterna || telaExterna.closed) return;
    const img = telaExterna.document.getElementById("slide");
    if (img) {
        img.src = url;
        slideIndex = 0;
    }
}

window.addEventListener('load', atualizarGaleria);

// --- LÓGICA DE TEMAS ---

function selectTheme(valor, nomeAmigavel) {
    selectedFilter = valor;
    currentScreen = 'main_capture';
    
    const tag = getEl('currentThemeTag');
    if (tag) tag.querySelector('span').innerText = nomeAmigavel.toUpperCase();
    
    getEl('themeSelection').style.display = 'none';
    getEl('landingPage').style.display = 'none';
    getEl('previewStage').style.display = 'none';
    getEl('captureStage').style.display = 'flex';
    getEl('mainApp').style.display = 'flex';
    
    getEl('finalPreview').src = '';
    getEl('qrcode').innerHTML = '';
    if (downloadBtn) downloadBtn.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';

    iniciarCamera();
}

if (getEl('changeThemeBtn')) {
    getEl('changeThemeBtn').addEventListener('click', () => {
        currentScreen = 'theme';
        getEl('mainApp').style.display = 'none';
        getEl('themeSelection').style.display = 'flex';
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
    });
}

// --- ATALHOS DE TECLADO COMPLETOS (1..8 Temas, 9 Galeria, 0 TV, ENTER Captura) ---
window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    const modalOpen = getEl('galleryModal') && getEl('galleryModal').style.display !== 'none';

    // Se o modal da galeria estiver aberto:
    if (modalOpen) {
        if (e.key === '9' || e.code === 'Digit9' || e.code === 'Numpad9' || e.key === 'Escape' || e.code === 'Escape' || e.key.toLowerCase() === 'g') {
            e.preventDefault();
            fecharModalGaleria();
            return;
        }
        if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0' || e.key.toLowerCase() === 't') {
            e.preventDefault();
            const openTvBtn = getEl('openTvBtn');
            if (openTvBtn) openTvBtn.click();
            return;
        }
    }

    const landingVisible = getEl('landingPage') && getEl('landingPage').style.display !== 'none';
    const themeVisible = getEl('themeSelection') && getEl('themeSelection').style.display === 'flex';
    const captureVisible = getEl('captureStage') && getEl('captureStage').style.display !== 'none' && getEl('mainApp') && getEl('mainApp').style.display === 'flex';
    const previewVisible = getEl('previewStage') && getEl('previewStage').style.display !== 'none';

    // Tecla 9 (ou G) para ABRIR/FECHAR a Galeria
    if (e.key === '9' || e.code === 'Digit9' || e.code === 'Numpad9' || e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (modalOpen) {
            fecharModalGaleria();
        } else {
            abrirModalGaleria();
        }
        return;
    }

    // Tecla 0 (ou T) para abrir TV
    if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0' || e.key.toLowerCase() === 't') {
        e.preventDefault();
        const openTvBtn = getEl('openTvBtn');
        if (openTvBtn) openTvBtn.click();
        return;
    }

    // Tecla ENTER ou ESPAÇO (Capturar / Confirmar / Nova Foto)
    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        
        if (captureVisible || currentScreen === 'main_capture') {
            if (captureBtn && !captureBtn.disabled) {
                captureBtn.click();
            }
        } else if (previewVisible || currentScreen === 'main_preview') {
            const resetBtn = getEl('resetBtn');
            if (resetBtn) resetBtn.click();
        } else if (themeVisible || currentScreen === 'theme') {
            selectTheme('DISCO.jpeg', 'Estilo Disco');
        } else if (landingVisible || currentScreen === 'landing') {
            const startBtn = getEl('startBtn');
            if (startBtn && !startBtn.disabled) startBtn.click();
        }
        return;
    }

    // Tecla 1 (Tema 1 na seleção / Trocar Tema na tela de captura / Nova foto na prévia)
    if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
        if (themeVisible || currentScreen === 'theme') {
            selectTheme('DISCO.jpeg', 'Estilo Disco');
        } else if (captureVisible || currentScreen === 'main_capture') {
            const changeBtn = getEl('changeThemeBtn');
            if (changeBtn) changeBtn.click();
        } else if (previewVisible || currentScreen === 'main_preview') {
            const resetBtn = getEl('resetBtn');
            if (resetBtn) resetBtn.click();
        }
        return;
    }

    // Tecla 2
    if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
        if (themeVisible || currentScreen === 'theme') {
            selectTheme('ROYALTY.jpeg', 'Estilo Real');
        }
        return;
    }

    // Teclas 3 a 8
    if (themeVisible || currentScreen === 'theme') {
        if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') selectTheme('VEGAS.jpeg', 'Estilo Vegas');
        if (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4') selectTheme('ALIEN.jpeg', 'Estilo Alien');
        if (e.key === '5' || e.code === 'Digit5' || e.code === 'Numpad5') selectTheme('fada_floresta.jpg', 'Floresta Encantada');
        if (e.key === '6' || e.code === 'Digit6' || e.code === 'Numpad6') selectTheme('Praia.jpeg', 'Estilo Praia');
        if (e.key === '7' || e.code === 'Digit7' || e.code === 'Numpad7') selectTheme('anos80.jpeg', 'Anos 80');
        if (e.key === '8' || e.code === 'Digit8' || e.code === 'Numpad8') selectTheme('INFANTIL.jpg', 'Infantil / Cartoon');
    }

    // Tecla ESC para fechar modais ou voltar
    if (e.key === 'Escape' || e.code === 'Escape') {
        if (modalOpen) {
            fecharModalGaleria();
        } else if (themeVisible) {
            getEl('themeSelection').style.display = 'none';
            getEl('landingPage').style.display = 'flex';
            currentScreen = 'landing';
        }
    }
});