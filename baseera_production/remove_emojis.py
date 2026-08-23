import os
import sys

try:
    import emoji
except ImportError:
    print("Please install the 'emoji' package first: pip install emoji")
    sys.exit(1)

def is_text_file(filename):
    exts = {'.html', '.py', '.js', '.ts', '.tsx', '.jsx', '.cs', '.json', '.txt', '.md', '.yml', '.yaml', '.css', '.csv'}
    return os.path.splitext(filename)[1].lower() in exts

def should_ignore_dir(dirname):
    ignores = {'.git', '.gemini', '__pycache__', 'node_modules', 'venv', '.venv', '.idea', 'bin', 'obj', '.dart_tool', 'build'}
    return dirname in ignores

def remove_emojis_from_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = emoji.replace_emoji(content, replace='')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        # Ignore files that can't be decoded as utf-8 or have other read issues
        pass
    return False

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
    print(f"Scanning directory: {base_dir}")
    
    modified_files = []
    
    for root, dirs, files in os.walk(base_dir):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if not should_ignore_dir(d)]
        
        for file in files:
            if is_text_file(file):
                filepath = os.path.join(root, file)
                if remove_emojis_from_file(filepath):
                    modified_files.append(filepath)
                    
    print(f"Removed emojis from {len(modified_files)} files.")
    for file in modified_files:
        # print relative path
        print(f" - {os.path.relpath(file, base_dir)}")

if __name__ == '__main__':
    main()
