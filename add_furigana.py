import json
import os
import sys
import pykakasi

# Add local pip bin to path if needed (though we'll use python imports)
# kks = pykakasi.kakasi()

def add_furigana(text, kks):
    result = kks.convert(text)
    html_output = ""
    for item in result:
        orig = item['orig']
        hira = item['hira']
        # If the original is different from hiragana (meaning it has Kanji)
        if orig != hira:
            # Simple check: if it's all kanji or mixed
            # pykakasi does a good job of splitting.
            # We wrap it in ruby
            html_output += f"<ruby>{orig}<rt>{hira}</rt></ruby>"
        else:
            html_output += orig
    return html_output

def process_bible():
    input_path = "public/data/bible/jou.json"
    output_path = "public/data/bible/jou_furigana.json"
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    print("Loading JOU Bible data...")
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    kks = pykakasi.kakasi()
    
    total_books = len(data['book'])
    current_book_count = 0
    
    print(f"Processing {total_books} books...")
    
    for book_id, book in data['book'].items():
        current_book_count += 1
        book_name = book['info']['name']
        print(f"[{current_book_count}/{total_books}] Processing {book_name}...")
        
        for chap_id, chapter in book['chapter'].items():
            for verse_id, verse in chapter['verse'].items():
                original_text = verse['text']
                # Skip if already has ruby tags? No, we assume it doesn't.
                verse['text'] = add_furigana(original_text, kks)

    print("Saving updated Bible data...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Done! Saved to {output_path}")

if __name__ == "__main__":
    process_bible()
