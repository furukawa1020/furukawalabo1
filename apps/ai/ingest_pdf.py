import sys
from pypdf import PdfReader
import os

def extract_text_from_pdf(pdf_path, output_path):
    print(f"Extracting content from: {pdf_path}")
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return

    try:
        reader = PdfReader(pdf_path)
        number_of_pages = len(reader.pages)
        print(f"Found {number_of_pages} pages.")

        markdown_content = f"# Project Proposal: Hacking Thinking\n\n**Source PDF**: {os.path.basename(pdf_path)}\n\n"

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            markdown_content += f"## Page {i+1}\n\n{text}\n\n---\n\n"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        
        print(f"Successfully saved extracted text to: {output_path}")

    except Exception as e:
        print(f"Error extracting text: {e}")

if __name__ == "__main__":
    pdf_source = r"c:\Users\hatake\Downloads\提案プロジェクト詳細資料Hacking Thinking！制約を遊び倒し続ける制作実行機の育成.pdf"
    md_output = r"c:\Users\hatake\OneDrive\画像\デスクトップ\.vscode\furukawalab\apps\ai\content\hacking_thinking_proposal.md"
    
    extract_text_from_pdf(pdf_source, md_output)
