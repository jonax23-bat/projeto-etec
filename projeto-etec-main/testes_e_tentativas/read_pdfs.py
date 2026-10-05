import os
import PyPDF2

def read_pdf(file_path):
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ''
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + '\n'
            return text
    except Exception as e:
        return f"Erro ao ler {file_path}: {e}"

files = [
    "Projeto ETEC - Estratégia Custo Zero (Processamento Local).pdf",
    "Projeto ETEC - Estratégia Custo Zero (Processamento Local) V2.pdf",
    "Projeto ETEC - Estratégia Custo Zero (Processamento Local) V3.pdf"
]

with open("pdfs_content.txt", "w", encoding="utf-8") as out:
    for file in files:
        out.write(f"--- Conteúdo de: {file} ---\n")
        out.write(read_pdf(file) + "\n")
        out.write("\n" + "="*50 + "\n\n")
