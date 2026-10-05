import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def criar_assets_instalador():
    base_dir = os.path.dirname(__file__)
    assets_dir = os.path.join(base_dir, "installer_assets")
    os.makedirs(assets_dir, exist_ok=True)
    
    logo_path = os.path.join(base_dir, "img", "logo.png")
    icon_path = os.path.join(base_dir, "img", "app-icon.png")
    
    # 1. Gerar app_icon.ico para o executável
    target_ico = os.path.join(assets_dir, "app_icon.ico")
    if os.path.exists(icon_path):
        src_icon = Image.open(icon_path).convert("RGBA")
        src_icon.save(target_ico, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
        print(f"[+] Ícone gerado: {target_ico}")
    elif os.path.exists(logo_path):
        src_icon = Image.open(logo_path).convert("RGBA")
        src_icon.save(target_ico, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
        print(f"[+] Ícone gerado a partir da logo: {target_ico}")

    # 2. Gerar WizardImageFile (Sidebar lateral: 164x314 ou 328x628 para telas HD)
    sidebar_w, sidebar_h = 328, 628
    sidebar = Image.new("RGB", (sidebar_w, sidebar_h), (11, 13, 20)) # #0B0D14
    
    # Desenhar degradê neon no fundo
    draw = ImageDraw.Draw(sidebar)
    for y in range(sidebar_h):
        # Transição suave do topo (#1a1a2e) para a base (#0b0d14)
        r = int(26 - (15 * (y / sidebar_h)))
        g = int(26 - (13 * (y / sidebar_h)))
        b = int(46 - (26 * (y / sidebar_h)))
        draw.line([(0, y), (sidebar_w, y)], fill=(r, g, b))
    
    # Adicionar detalhes em ciano e roxo neon
    draw.line([(0, 0), (sidebar_w, 0)], fill=(0, 212, 255), width=4)
    draw.line([(0, sidebar_h - 4), (sidebar_w, sidebar_h - 4)], fill=(108, 92, 255), width=4)
    
    # Colocar logo no centro da sidebar
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert("RGBA")
        # Redimensionar logo mantendo aspecto
        lw = int(sidebar_w * 0.75)
        lh = int(logo_img.height * (lw / logo_img.width))
        logo_resized = logo_img.resize((lw, lh), Image.Resampling.LANCZOS)
        
        pos_x = (sidebar_w - lw) // 2
        pos_y = (sidebar_h - lh) // 2 - 40
        sidebar.paste(logo_resized, (pos_x, pos_y), mask=logo_resized.split()[3])
    
    sidebar_bmp = os.path.join(assets_dir, "wizard_sidebar.bmp")
    sidebar.save(sidebar_bmp, format="BMP")
    print(f"[+] Wizard Sidebar BMP gerado: {sidebar_bmp}")

    # 3. Gerar WizardSmallImageFile (Header superior: 110x116)
    header_w, header_h = 110, 116
    header = Image.new("RGB", (header_w, header_h), (11, 13, 20))
    if os.path.exists(logo_path):
        logo_img = Image.open(logo_path).convert("RGBA")
        lw = int(header_w * 0.8)
        lh = int(logo_img.height * (lw / logo_img.width))
        logo_resized = logo_img.resize((lw, lh), Image.Resampling.LANCZOS)
        pos_x = (header_w - lw) // 2
        pos_y = (header_h - lh) // 2
        header.paste(logo_resized, (pos_x, pos_y), mask=logo_resized.split()[3])
        
    header_bmp = os.path.join(assets_dir, "wizard_header.bmp")
    header.save(header_bmp, format="BMP")
    print(f"[+] Wizard Header BMP gerado: {header_bmp}")

if __name__ == "__main__":
    criar_assets_instalador()
