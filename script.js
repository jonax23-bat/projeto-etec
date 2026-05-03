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

// --- NAVEGAÇÃO COM VALIDAÇÃO ---
getEl('startBtn').addEventListener('click', async () => {
    const landing = getEl('landingPage');
    const app = getEl('mainApp');
    const startBtn = getEl('startBtn');

    if (landing && app) {
        startBtn.innerText = "VERIFICANDO...";
        startBtn.disabled = true;

        const apiAtiva = await validarCredenciaisCloudinary();

        if (apiAtiva) {
            landing.style.display = 'none';
            app.style.display = 'flex';
            iniciarCamera();
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
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { 
            if(video) video.srcObject = stream; 
            if(captureBtn) captureBtn.disabled = false;
        })
        .catch(() => exibirErroCamera("CÂMERA INDISPONÍVEL", "Verifique as permissões."));
}

function exibirErroCamera(titulo, mensagem) {
    if(video) video.style.display = 'none';
    if(captureBtn) captureBtn.disabled = true;
    getEl('container').innerHTML = `
        <div style="text-align:center;color:#ff4d4d;padding:20px; font-family:'Orbitron', sans-serif;">
            <span style="font-size: 3rem;">⚠️</span><br>
            <b>${titulo}</b><br><small>${mensagem}</small>
        </div>`;
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
        }
    })
    .catch(() => { 
        getEl('status').innerText = "❌ ERRO"; 
        captureBtn.disabled = false;
    });
}

getEl('resetBtn').addEventListener('click', () => {
    getEl('previewStage').style.display = 'none';
    getEl('captureStage').style.display = 'grid';
    getEl('finalPreview').src = "";
    getEl('qrcode').innerHTML = "";
    if(downloadBtn) downloadBtn.style.display = 'none';
    if(progressBar) progressBar.style.width = "0%";
    // Só libera o botão se a câmera estiver realmente transmitindo
    if (video.srcObject && video.srcObject.active) {
        captureBtn.disabled = false;
    } else {
        captureBtn.disabled = true;
        iniciarCamera(); // Tenta recuperar a câmera se ela tiver sido perdida
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