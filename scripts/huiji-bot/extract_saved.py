"""Extract a Huiji character page already saved as HTML by the user."""
import argparse
import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location('biligame_parser', Path(__file__).resolve().parent.parent / 'biligame-bot' / 'collect.py')
parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parser)


def extract(html, source_file):
    tree = parser.Tree()
    tree.feed(html)
    root = next((n for n in tree.root.walk() if 'chara-skins' in parser.classes(n)), None)
    if root is None:
        raise ValueError('No character skin section found; file may be a challenge or incompatible page')
    nodes = list(root.walk())
    desc = next((n for n in nodes if 'desc' in parser.classes(n)), None)
    images = {}
    for item in nodes:
        if 'tabber-item' in parser.classes(item) and item.attrs.get('data-sprite'):
            img = next((n for n in item.walk() if n.tag == 'img'), None)
            if img:
                images[item.attrs['data-sprite']] = img.attrs.get('src')
    skins = []
    for item in nodes:
        if 'tabber-filter-item' not in parser.classes(item):
            continue
        img = next((n for n in item.walk() if n.tag == 'img'), None)
        if img:
            sprite = item.attrs.get('data-sprite')
            skins.append({'sprite': sprite, 'name_zh': img.attrs.get('alt'), 'icon_url': img.attrs.get('src'), 'image_url': images.get(sprite)})
    if not skins:
        raise ValueError('No appearances found; file may be incomplete')
    return {'source_file': str(source_file), 'introduction_zh': desc.text().strip() if desc else None, 'skins': skins, 'warnings': [s['sprite'] for s in skins if not s['icon_url'] or not s['image_url']]}


def main():
    p = argparse.ArgumentParser(description='Extract from locally saved Huiji HTML files')
    p.add_argument('files', nargs='+', type=Path)
    p.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parent / 'output' / 'saved-pages')
    args = p.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for path in args.files:
        try:
            result = extract(path.read_text(encoding='utf-8'), path)
            output = args.output_dir / (path.stem + '.json')
            if output.exists():
                print('Already saved, skipped:', output)
                continue
            output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print('Saved:', output, 'appearances:', len(result['skins']))
        except (OSError, ValueError) as exc:
            print('Failed:', path, ascii(str(exc)))


if __name__ == '__main__':
    main()
