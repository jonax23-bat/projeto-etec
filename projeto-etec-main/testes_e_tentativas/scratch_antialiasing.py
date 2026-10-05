import cv2
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
import time

def suave_recorte_antialiasing(img_rgba):
    """
    Remove serrilhado, halos de cor e ruídos nas bordas do recorte,
    gerando transições suaves de nível profissional.
    """
    arr = np.array(img_rgba)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]

    # 1. Suavizar máscara com Gaussian Blur suave na borda
    alpha_float = alpha.astype(np.float32) / 255.0
    
    # Criar máscara de borda (onde a transição ocorre)
    edge_zone = cv2.Canny(alpha, 50, 200)
    edge_zone = cv2.dilate(edge_zone, np.ones((3, 3), np.uint8), iterations=1)

    # Suavização suave na zona de transição
    alpha_smooth = cv2.GaussianBlur(alpha, (5, 5), sigmaX=1.2)
    alpha_final = np.where(edge_zone > 0, alpha_smooth, alpha)

    # 2. Decontaminação de cor de borda (inward color push para eliminar halo de parede)
    # Erode leve da máscara para pegar cor limpa do interior da pessoa
    inner_mask = (alpha > 230).astype(np.uint8)
    if cv2.countNonZero(inner_mask) > 100:
        # Inpaint para preencher bordas com a cor real da roupa/pele e não da parede branca
        clean_rgb = cv2.inpaint(rgb, (edge_zone > 0).astype(np.uint8), inpaintRadius=3, flags=cv2.INPAINT_TELEA)
        # Mesclar suavemente na borda
        alpha_factor = (alpha_final.astype(np.float32) / 255.0)[:, :, np.newaxis]
        rgb_blend = np.clip(clean_rgb * (1.0 - alpha_factor * 0.3) + rgb * (alpha_factor * 0.3 + 0.7), 0, 255).astype(np.uint8)
    else:
        rgb_blend = rgb

    res = np.dstack((rgb_blend, alpha_final))
    return Image.fromarray(res, mode='RGBA')

print("Filtro anti-aliasing pronto!")
