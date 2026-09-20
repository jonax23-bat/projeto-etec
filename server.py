import os
import io
import json
import base64
import time
import requests
import numpy as np
import cv2
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
from rembg import remove, new_session
from PIL import Image

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# --- PRÉ-CARREGAMENTO E OTIMIZAÇÃO DE IA EM MEMÓRIA ---
print("[*] Pré-carregando modelo de IA ultra nítido (u2net_human_seg) para pessoas...")
try:
    ai_session = new_session("u2net_human_seg")
    # Forçar warm-up (aquecimento da GPU/CPU) com imagem vazia
    dummy_warmup = Image.fromarray(np.zeros((128, 128, 3), dtype=np.uint8))
    _ = remove(dummy_warmup, session=ai_session)
    print("[+] Modelo u2net_human_seg aquecido e pronto com precisão máxima!")
except Exception as e:
    print(f"[!] Aviso: inicializando com modelo padrão ({e})")
    try:
        ai_session = new_session("u2net")
    except Exception:
        ai_session = None

def get_bounding_box_alpha(img_rgba):
    alpha = np.array(img_rgba)[:, :, 3]
    y_indices, x_indices = np.where(alpha > 15)
    if len(y_indices) == 0 or len(x_indices) == 0:
        return 0, 0, img_rgba.width, img_rgba.height
    return int(np.min(x_indices)), int(np.min(y_indices)), int(np.max(x_indices)), int(np.max(y_indices))

def suavizar_bordas_antialiasing(img_rgba):
    """
    Suaviza perfeitamente o contorno da pessoa, eliminando serrilhado,
    artefatos de compressão e manchas de parede de fundo.
    """
    arr = np.array(img_rgba)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]

    # 1. Filtro morfológico suave para remover micro-buracos e rebarbas
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_clean = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)

    # 2. Feathering inteligente com Gaussian Blur
    # Apenas na borda de transição (valores entre 10 e 245)
    transition_mask = ((alpha_clean > 5) & (alpha_clean < 250)).astype(np.uint8)
    if cv2.countNonZero(transition_mask) > 0:
        blurred_alpha = cv2.GaussianBlur(alpha_clean, (5, 5), sigmaX=1.0)
        alpha_final = np.where(transition_mask > 0, blurred_alpha, alpha_clean)
    else:
        alpha_final = alpha_clean

    # 3. Suavização sutil de borda RGB para evitar halos escuros
    res = np.dstack((rgb, alpha_final))
    return Image.fromarray(res, mode='RGBA')

def executar_pipeline_edicao(img_camera_pil, theme_filename, cloud_name=None, upload_preset=None):
    start_time = time.time()
    
    # 1. Manter boa resolução de entrada (até 1920px)
    w, h = img_camera_pil.size
    max_dim = 1920
    if max(w, h) > max_dim:
        scale = max_dim / max(w, h)
        img_camera_pil = img_camera_pil.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    # 2. Remoção de fundo de alta precisão
    if ai_session:
        raw_rgba = remove(
            img_camera_pil,
            session=ai_session,
            post_process_mask=True
        )
    else:
        raw_rgba = remove(img_camera_pil, post_process_mask=True)

    # Aplica suavização anti-serrilhado profissional
    img_rgba = suavizar_bordas_antialiasing(raw_rgba)

    # 3. Composição profissional mantendo proporção e qualidade do fundo
    if not theme_filename or theme_filename == 'none':
        final_img = img_rgba
    else:
        bg_path = os.path.join(os.path.dirname(__file__), 'img', theme_filename)
        if os.path.exists(bg_path):
            bg_img = Image.open(bg_path).convert("RGBA")
        else:
            bg_img = Image.new("RGBA", (1080, 1920), (20, 20, 35, 255))
        
        bg_w, bg_h = bg_img.size

        # Encontrar área útil do sujeito e recortar margens vazias
        min_x, min_y, max_x, max_y = get_bounding_box_alpha(img_rgba)
        person_crop = img_rgba.crop((min_x, min_y, max_x, max_y))
        pw, ph = person_crop.size

        if pw > 0 and ph > 0:
            # Escalar proporcionalmente o sujeito para ocupar ~82% da altura do fundo
            target_h = int(bg_h * 0.82)
            scale = target_h / ph
            target_w = int(pw * scale)

            if target_w > bg_w * 0.95:
                target_w = int(bg_w * 0.95)
                scale = target_w / pw
                target_h = int(ph * scale)

            person_scaled = person_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
            pos_x = (bg_w - target_w) // 2
            pos_y = bg_h - target_h

            # Harmonização de iluminação Reinhard suave
            person_np = np.array(person_scaled)
            bg_sub_np = np.array(bg_img.crop((pos_x, pos_y, pos_x + target_w, pos_y + target_h)).convert("RGB"))

            p_rgb = person_np[:, :, :3]
            p_alpha = person_np[:, :, 3]
            mask = (p_alpha > 20).astype(np.uint8)

            if np.sum(mask) > 100:
                p_lab = cv2.cvtColor(p_rgb, cv2.COLOR_RGB2LAB).astype("float32")
                bg_lab = cv2.cvtColor(bg_sub_np, cv2.COLOR_RGB2LAB).astype("float32")

                p_m, p_std = cv2.meanStdDev(p_lab, mask=mask)
                bg_m, bg_std = cv2.meanStdDev(bg_lab)
                p_std[p_std == 0] = 1

                lab_harmonized = ((p_lab - np.squeeze(p_m)) * (np.squeeze(bg_std) / np.squeeze(p_std))) + np.squeeze(bg_m)
                lab_harmonized = np.clip(lab_harmonized, 0, 255).astype("uint8")
                rgb_harm = cv2.cvtColor(lab_harmonized, cv2.COLOR_LAB2RGB)

                rgb_final = np.clip(p_rgb * 0.4 + rgb_harm * 0.6, 0, 255).astype("uint8")
                person_np[:, :, :3] = rgb_final

            person_final = Image.fromarray(person_np, mode='RGBA')
            final_img = bg_img.copy()
            final_img.paste(person_final, (pos_x, pos_y), person_final)
        else:
            final_img = bg_img

    # 4. Exportação em alta qualidade (qualidade 92)
    buffered = io.BytesIO()
    final_img.convert("RGB").save(buffered, format="JPEG", quality=92, optimize=True)
    img_bytes = buffered.getvalue()
    
    elapsed_time = round(time.time() - start_time, 2)
    print(f"[+] Pipeline de IA concluído em {elapsed_time}s")

    # 5. Upload Cloudinary ou Base64
    if cloud_name and upload_preset:
        url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
        payload = {'upload_preset': upload_preset}
        files = {'file': ('foto.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(url, data=payload, files=files, timeout=15)
        result = response.json()
        if 'secure_url' in result:
            return {'secure_url': result['secure_url'], 'elapsed_time': elapsed_time}
        else:
            return {'error': 'Erro no Cloudinary', 'details': result, 'elapsed_time': elapsed_time}
    else:
        final_base64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")
        return {'image_base64': final_base64, 'elapsed_time': elapsed_time}

# --- PERSISTÊNCIA DA GALERIA EM REDE ---
GALLERY_FILE = os.path.join(os.path.dirname(__file__), 'gallery_data.json')

def carregar_galeria_servidor():
    if os.path.exists(GALLERY_FILE):
        try:
            with open(GALLERY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def salvar_galeria_servidor(lista):
    try:
        with open(GALLERY_FILE, 'w', encoding='utf-8') as f:
            json.dump(lista, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[!] Erro ao salvar galeria_data.json: {e}")

# --- ROTAS DA API ---

@app.route('/')
def index_page():
    return send_from_directory(os.path.dirname(__file__), 'index.html')

@app.route('/tv')
@app.route('/tv.html')
def tv_page():
    return send_from_directory(os.path.dirname(__file__), 'tv.html')

@app.route('/galeria')
@app.route('/galeria.html')
def galeria_page():
    return send_from_directory(os.path.dirname(__file__), 'galeria.html')

@app.route('/api/gallery', methods=['GET', 'POST', 'DELETE'])
def api_gallery():
    if request.method == 'GET':
        fotos = carregar_galeria_servidor()
        return jsonify({'photos': fotos, 'count': len(fotos)})
    elif request.method == 'POST':
        data = request.json or {}
        url = data.get('url')
        if url:
            fotos = carregar_galeria_servidor()
            if url not in fotos:
                fotos.insert(0, url)
                if len(fotos) > 50:
                    fotos = fotos[:50]
                salvar_galeria_servidor(fotos)
            return jsonify({'status': 'ok', 'photos': fotos})
        return jsonify({'error': 'URL ausente'}), 400
    elif request.method == 'DELETE':
        salvar_galeria_servidor([])
        return jsonify({'status': 'cleared', 'photos': []})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'ai_ready': ai_session is not None})

@app.route('/process', methods=['POST'])
def process_image():
    try:
        data = request.json
        if not data or 'image' not in data or 'theme' not in data:
            return jsonify({'error': 'Faltam dados na requisição (image, theme)'}), 400

        base64_image = data['image']
        theme_filename = data['theme']
        cloud_name = data.get('cloudName', '')
        upload_preset = data.get('uploadPreset', '')

        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]

        image_bytes = base64.b64decode(base64_image)
        img_camera = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        result = executar_pipeline_edicao(img_camera, theme_filename, cloud_name, upload_preset)
        
        # Se gerou uma URL válida, registra automaticamente na galeria de rede
        if 'secure_url' in result:
            fotos = carregar_galeria_servidor()
            if result['secure_url'] not in fotos:
                fotos.insert(0, result['secure_url'])
                if len(fotos) > 50:
                    fotos = fotos[:50]
                salvar_galeria_servidor(fotos)

        return jsonify(result)
    except Exception as e:
        print(f"[ERRO /process]: {e}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

if __name__ == '__main__':
    print("Iniciando Servidor PixelAI API (Processamento Local IA + Webcam)...")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
