import sys
from PIL import Image
import numpy as np

def preload():
    print("[*] Pre-carregando modelo de Inteligencia Artificial (rembg)...")
    try:
        from rembg import remove, new_session
        
        # Cria imagem dummy 100x100 para forcar o download e compilacao do modelo ONNX
        dummy_img = Image.fromarray(np.zeros((100, 100, 3), dtype=np.uint8))
        session = new_session("u2net")
        _ = remove(dummy_img, session=session)
        print("[+] Modelo de IA carregado e salvo em cache local com sucesso!")
        return True
    except Exception as e:
        print(f"[!] Aviso durante pre-carregamento do modelo de IA: {e}")
        return False

if __name__ == "__main__":
    preload()
