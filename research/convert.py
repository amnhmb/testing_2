import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        # The namespace for Word XML
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in tree.findall('.//w:p', namespace):
            texts = [node.text for node in paragraph.findall('.//w:t', namespace) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n\n'.join(paragraphs)
    except Exception as e:
        return f"Error: {str(e)}"

docx_files = [
    r"c:\Users\User\Desktop\Songket Kelantan\Research\PRD-Kad-Kahwin-Digital.docx",
    r"c:\Users\User\Desktop\Songket Kelantan\Research\Songket_Kelantan_Motif_Teras.docx"
]

for docx_path in docx_files:
    if os.path.exists(docx_path):
        text = extract_text_from_docx(docx_path)
        out_path = docx_path.replace('.docx', '.md')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Converted {os.path.basename(docx_path)} to .md")
    else:
        print(f"File not found: {docx_path}")
