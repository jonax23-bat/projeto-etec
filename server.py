import os
import io
import base64
import requests
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image

app = Flask(__name__)
CORS(app)

def aplicar_ambientalizacao(objeto_np, fundo_np, mascara_alfa):
    """
    Aplica o algoritmo de Reinhard no espaço LAB para harmonizar as cores
    do objeto recortado com o cenário de fundo.
    objeto_np: Imagem RGB do objeto (sem canal alfa) - shape (H, W, 3)
    fundo_np: Imagem RGB do fundo - shape (H, W, 3)
    mascara_alfa: Canal alfa do objeto (0 a 255) - shape (H, W)
    """
    # Converte ambas as imagens para o espaço de cores LAB
    obj_lab = cv2.cvtColor(objeto_np, cv2.COLOR_RGB2LAB).astype("float32")
    fnd_lab = cv2.cvtColor(fundo_np, cv2.COLOR_RGB2LAB).astype("float32")

    # Calcula médias e desvios padrão do fundo
    fnd_m, fnd_std = cv2.meanStdDev(fnd_lab)
    
    # Cria uma máscara binária (1 para pixels do objeto, 0 para o fundo/transparente)
    mask = (mascara_alfa > 0).astype(np.uint8)
    
    # Se a máscara estiver vazia, não faz nada
    if cv2.countNonZero(mask) == 0:
        return objeto_np
    
    # Calcula médias e desvios padrão do objeto, considerando apenas a área visível (máscara)
    obj_m, obj_std = cv2.meanStdDev(obj_lab, mask=mask)

    # Evita divisão por zero
    obj_std[obj_std == 0] = 1

    # Harmoniza os canais de cor do objeto com base no fundo
    resultado = ((obj_lab - np.squeeze(obj_m)) * (np.squeeze(fnd_std) / np.squeeze(obj_std))) + np.squeeze(fnd_m)
    
    # Limita os valores aos limites do LAB (0 a 255 para L, a, b no OpenCV uint8, mas aqui estamos em float32)
    # L vai de 0 a 255, a e b tbm 0 a 255 no cv2 8-bit LAB
    resultado = np.clip(resultado, 0, 255).astype("uint8")

    # Converte de volta para RGB
    return cv2.cvtColor(resultado, cv2.COLOR_LAB2RGB)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

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

        # 1. Decodificar a imagem da câmera
        image_bytes = base64.b64decode(base64_image)
        img_camera = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # 2. Remoção de fundo usando rembg
        # O rembg retorna uma imagem RGBA
        img_sem_fundo = remove(img_camera)

        # Se for o 'teste' sem tema específico, devolvemos apenas com o fundo transparente ou sem harmonizar
        if not theme_filename or theme_filename == 'none':
            final_img = img_sem_fundo
        else:
            # 3. Carregar o fundo estático
            bg_path = os.path.join(os.path.dirname(__file__), 'img', theme_filename)
            if not os.path.exists(bg_path):
                return jsonify({'error': f'Tema não encontrado: {theme_filename}'}), 404
            
            img_bg = Image.open(bg_path).convert("RGBA")
            # Redimensiona o fundo para o tamanho da foto da câmera
            img_bg = img_bg.resize(img_sem_fundo.size)

            # 4. Ambientalização / Harmonização (OpenCV)
            # Converter imagens Pillow para arrays NumPy
            obj_np = np.array(img_sem_fundo)
            bg_np = np.array(img_bg.convert("RGB"))
            
            # Extrair os canais RGB e Alfa do objeto recortado
            obj_rgb = obj_np[:, :, :3]
            obj_alpha = obj_np[:, :, 3]

            # Aplicar harmonização
            obj_rgb_harmonized = aplicar_ambientalizacao(obj_rgb, bg_np, obj_alpha)

            # Reconstruir a imagem RGBA harmonizada
            harmonized_rgba = np.zeros_like(obj_np)
            harmonized_rgba[:, :, :3] = obj_rgb_harmonized
            harmonized_rgba[:, :, 3] = obj_alpha

            # Converter de volta para Pillow
            img_harmonizada_pil = Image.fromarray(harmonized_rgba, mode='RGBA')

            # 5. Composição (Fundir a imagem harmonizada no fundo estático)
            final_img = Image.alpha_composite(img_bg, img_harmonizada_pil)

        # 6. Upload para o Cloudinary (se os dados foram fornecidos)
        buffered = io.BytesIO()
        final_img.convert("RGB").save(buffered, format="JPEG", quality=85)
        img_bytes = buffered.getvalue()

        if cloud_name and upload_preset:
            url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
            payload = {'upload_preset': upload_preset}
            files = {'file': ('foto.jpg', img_bytes, 'image/jpeg')}
            response = requests.post(url, data=payload, files=files)
            result = response.json()
            if 'secure_url' in result:
                return jsonify({'secure_url': result['secure_url']})
            else:
                return jsonify({'error': 'Erro no Cloudinary', 'details': result}), 500
        else:
            # Caso não queira fazer upload, apenas retorna a imagem base64
            final_base64 = "data:image/jpeg;base64," + base64.b64encode(img_bytes).decode("utf-8")
            return jsonify({'image_base64': final_base64})

    except Exception as e:
        print(f"Erro ao processar: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Iniciando Servidor PixelAI API (Processamento Local)...")
    app.run(host='0.0.0.0', port=5000, debug=True)
