import sys
import os

pdf_path = r"c:\Users\hatake\Downloads\予稿本番interaction2026251214furukawa2_251214furukawa.pdf"

try:
    import pypdf
    print("Using pypdf")
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print(text)
except ImportError:
    try:
        import PyPDF2
        print("Using PyPDF2")
        reader = PyPDF2.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except ImportError:
        print("Error: neither pypdf nor PyPDF2 is installed.")
