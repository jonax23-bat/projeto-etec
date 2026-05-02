// 1. CONFIGURAÇÃO
const CLOUD_NAME = "dg668htg4";
const UPLOAD_PRESET = "preset-1";

// 2. ELEMENTOS
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const aiStyle = document.getElementById('aiStyle');
const resultDiv = document.getElementById('result');
const statusTxt = document.getElementById('status');

// 3. INICIAR CÂMERA
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => {
        console.error("Erro na câmera:", err);
        
        // Esconde o elemento de vídeo vazio
        document.getElementById('video').style.display = 'none';
        
        // Cria e exibe uma mensagem de erro visual
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = '📷 Câmera indisponível ou permissão negada.<br><br>Por favor, utilize a opção "📁 Anexar Imagem" abaixo.';
        errorMsg.style.color = '#ff4d4d'; // Vermelho suave
        errorMsg.style.textAlign = 'center';
        errorMsg.style.padding = '80px 20px';
        errorMsg.style.boxSizing = 'border-box';
        errorMsg.style.lineHeight = '1.5'; // <-- Corrige a sobreposição
        document.getElementById('container').appendChild(errorMsg);
        
        // Desabilita o botão de tirar foto pois não há câmera
        document.getElementById('captureBtn').disabled = true;
    });

// 4. EVENTO PARA ANEXAR (CORRIGIDO)
document.getElementById('uploadBtn').addEventListener('click', () => {
    fileInput.click();
});

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

// 5. EVENTO PARA TIRAR FOTO
document.getElementById('captureBtn').addEventListener('click', () => {
    processarEEnviar(video);
});

// 6. PROCESSAMENTO
function processarEEnviar(fonte) {
    const MAX_WIDTH = 1280; 
    let larguraOriginal = fonte.videoWidth || fonte.width;
    let alturaOriginal = fonte.videoHeight || fonte.height;
    
    let novaLargura = larguraOriginal;
    let novaAltura = alturaOriginal;

    if (larguraOriginal > MAX_WIDTH) {
        novaLargura = MAX_WIDTH;
        novaAltura = (alturaOriginal * MAX_WIDTH) / larguraOriginal;
    }

    canvas.width = novaLargura;
    canvas.height = novaAltura;
    ctx.drawImage(fonte, 0, 0, novaLargura, novaAltura);
    
    resultDiv.style.display = 'block';
    statusTxt.innerText = "🚀 Enviando para a Nuvem...";

    // Desabilitar controles durante o envio
    document.getElementById('uploadBtn').disabled = true;
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('aiStyle').disabled = true;

    const dataURL = canvas.toDataURL('image/jpeg', 0.7);
    enviarParaCloudinary(dataURL);
}

// 7. ENVIO CLOUDINARY
function enviarParaCloudinary(base64Image) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', UPLOAD_PRESET);

    fetch(url, { method: 'POST', body: formData })
    .then(async response => {
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error ? result.error.message : "Erro no servidor");
        }
        return result;
    })
    .then(data => {
        // Reabilitar controles
        document.getElementById('uploadBtn').disabled = false;
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('aiStyle').disabled = false;

        if (data.secure_url) {
            let filtro = aiStyle.value.replace(/ /g, '%20'); 
            const urlFinalIA = data.secure_url.replace('/upload/', `/upload/${filtro}/`);
            
            document.getElementById('qrcode').innerHTML = ""; 
            new QRCode(document.getElementById("qrcode"), {
                text: urlFinalIA, 
                width: 250, 
                height: 250,
                correctLevel : QRCode.CorrectLevel.M
            });

            // Mostra a prévia da imagem
            const finalPreview = document.getElementById('finalPreview');
            if (finalPreview) {
                finalPreview.src = urlFinalIA;
                finalPreview.style.display = 'block';
            }
            
            statusTxt.innerText = "✅ Foto pronta!";
        }
    })
    .catch((err) => { 
        // Reabilitar controles em caso de erro
        document.getElementById('uploadBtn').disabled = false;
        document.getElementById('captureBtn').disabled = false;
        document.getElementById('aiStyle').disabled = false;

        console.error("Erro Real:", err);
        statusTxt.innerText = "❌ Erro: " + err.message; 
    });
}

// 8. RESETAR PROJETO
document.getElementById('resetBtn').addEventListener('click', () => {
    // Esconde a área de resultado
    resultDiv.style.display = 'none';
    
    // Limpa a foto
    const finalPreview = document.getElementById('finalPreview');
    if (finalPreview) {
        finalPreview.src = "";
        finalPreview.style.display = 'none';
    }
    
    // Limpa o QR Code
    document.getElementById('qrcode').innerHTML = "";
    
    // Volta o texto de status
    statusTxt.innerText = "A processar...";
});