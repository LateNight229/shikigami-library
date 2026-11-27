"""Collect a single public BiliGame character page into a review snapshot."""
import argparse
import json
import re
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.error import HTTPError
from urllib.request import Request, urlopen

DEFAULT = 'https://wiki.biligame.com/yys/笼梦祸津神'
CATALOG = 'https://wiki.biligame.com/yys/式神档册'
VOID = {'img', 'br', 'meta', 'link', 'input', 'hr', 'source', 'wbr', 'embed', 'area', 'base', 'col', 'param', 'track'}


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        if self.tag in ('script', 'style'):
            return ''
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def classes(node):
    return node.attrs.get('class', '').split()


def catalog_entries(html):
    tree = Tree()
    tree.feed(html)
    entries, seen = [], set()
    for row in tree.root.walk():
        name = row.attrs.get('data-tjtname')
        if row.tag != 'tr' or 'divsort' not in classes(row) or not name:
            continue
        links = [n for n in row.walk() if n.tag == 'a' and n.attrs.get('title') == name]
        if not links:
            raise ValueError('Catalog row has no matching character link: ' + name)
        url = urljoin(CATALOG, links[0].attrs.get('href', ''))
        if urlparse(url).hostname != 'wiki.biligame.com' or not urlparse(url).path.startswith('/yys/'):
            raise ValueError('Invalid character link: ' + url)
        if url not in seen:
            entries.append({'name_zh': name, 'rarity': row.attrs.get('data-paramxyd'), 'url': url})
            seen.add(url)
    if not entries:
        raise ValueError('No character rows found in catalog')
    return entries


def save_snapshot(path, snapshot):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def http_message(exc):
    if exc.code in (514, 567):
        return (f'HTTP {exc.code}: the wiki/CDN rejected this request. '
                'Stopped; wait at least several minutes before trying again. '
                'If it persists, contact the wiki administrator.')
    return f'HTTP {exc.code}: stopped. Check the wiki and try again later.'


def collect_all(target, limit=None, delay=2.0, catalog_file=None):
    if target.exists():
        snapshot = json.loads(target.read_text(encoding='utf-8'))
        if snapshot.get('scope') != 'catalog_review':
            raise ValueError('Output is not a catalog snapshot; choose another output path')
        catalog = snapshot['catalog']
    else:
        catalog = json.loads(catalog_file.read_text(encoding='utf-8')) if catalog_file else catalog_entries(fetch(CATALOG))
        if not isinstance(catalog, list) or not catalog:
            raise ValueError('Catalog list is empty or invalid')
        snapshot = {'scope': 'catalog_review', 'catalog_url': CATALOG, 'catalog': catalog, 'records': {}, 'errors': {}, 'complete': False}
        save_snapshot(target, snapshot)
    pending = [e for e in catalog if e['url'] not in snapshot['records']]
    if limit is not None:
        pending = pending[:limit]
    print(f'Catalog: {len(catalog)}; saved: {len(snapshot["records"])}; to attempt: {len(pending)}', flush=True)
    for entry in pending:
        time.sleep(delay)
        url = entry['url']
        try:
            record = extract(fetch(url), url)
            record['catalog_name_zh'] = entry['name_zh']
            record['catalog_rarity'] = entry['rarity']
            record['collected_at_utc'] = datetime.now(timezone.utc).isoformat()
            snapshot['records'][url] = record
            snapshot['errors'].pop(url, None)
        except HTTPError as exc:
            snapshot['errors'][url] = f'HTTP {exc.code}'
            save_snapshot(target, snapshot)
            print(http_message(exc), flush=True)
            return False
        except (OSError, ValueError) as exc:
            snapshot['errors'][url] = str(exc)
        snapshot['updated_at_utc'] = datetime.now(timezone.utc).isoformat()
        snapshot['complete'] = len(snapshot['records']) == len(catalog)
        save_snapshot(target, snapshot)
        print(f'Processed {len(snapshot["records"])}/{len(catalog)}; errors: {len(snapshot["errors"])}', flush=True)
    return snapshot['complete']


def extract(html, url):
    tree = Tree()
    tree.feed(html)
    nodes = list(tree.root.walk())
    card = next((n for n in nodes if 'role-card' in classes(n)), None)
    if not card:
        raise ValueError('Không tìm thấy hồ sơ nhân vật; cấu trúc nguồn có thể đã thay đổi')
    card_nodes = list(card.walk())
    def find(cls):
        return next((n for n in card_nodes if cls in classes(n)), None)
    intro, title = find('role-card__intro-content'), find('role-card__title')
    skins = []
    for tab in (n for n in card_nodes if 'tabbertab' in classes(n)):
        img = next((n for n in tab.walk() if n.tag == 'img'), None)
        if img:
            srcset = img.attrs.get('srcset', '')
            candidates = [part.strip().split()[0] for part in srcset.split(',') if part.strip()]
            skins.append({'name_zh': tab.attrs.get('title', '').strip(), 'image_url': urljoin(url, candidates[-1] if candidates else img.attrs.get('src', '')), 'preview_url': urljoin(url, img.attrs.get('src', '')), 'width': img.attrs.get('data-file-width'), 'height': img.attrs.get('data-file-height')})
    pane = next((n for n in nodes if n.attrs.get('id') == 'tab_pane_召唤动画'), None)
    scripts = '\n'.join(''.join(c for c in n.children if isinstance(c, str)) for n in pane.walk() if n.tag == 'script') if pane else ''
    match = re.search(r'const\s+(?:bv|Bvid|rawBV)\s*=\s*[`\'"](BV[A-Za-z0-9]{10})', scripts)
    bv = match.group(1) if match else None
    mode_values = re.findall(r'var\s+val[12]\s*=\s*`([^`]*)`', scripts)
    mode = next((v for v in reversed(mode_values) if v), '1')
    page_match = re.search(r'const\s+p\s*=\s*`(\d*)`', scripts)
    page = int(page_match.group(1) or '1') if mode == '1' and page_match else None
    video_url = f'https://www.bilibili.com/video/{bv}?p={page}' if bv and page else None
    return {'source_url': url, 'name_zh': title.text().strip() if title else None, 'introduction_zh': ' '.join(intro.text().split()) if intro else None, 'skins': skins, 'summon_video': {'bvid': bv, 'page': page, 'url': video_url, 'status': 'found' if video_url else ('unrecognized' if pane else 'not_listed')}, 'warnings': [x for x, bad in [('missing_introduction', not intro), ('missing_skin_images', not skins), ('summon_video_unrecognized', bool(pane and not video_url))] if bad]}


def fetch(url):
    parsed = urlparse(url)
    if parsed.scheme != 'https' or parsed.hostname != 'wiki.biligame.com' or not parsed.path.startswith('/yys/'):
        raise ValueError('Chỉ hỗ trợ trang https://wiki.biligame.com/yys/...')
    from urllib.parse import quote
    safe_url = quote(url, safe=':/%?=&')
    for attempt in range(3):
        try:
            with urlopen(Request(safe_url, headers={'User-Agent': 'Mozilla/5.0 (compatible; ShikiLibResearch/1.0)'}), timeout=30) as response:
                if urlparse(response.url).hostname != 'wiki.biligame.com':
                    raise ValueError('Chuyển hướng ngoài wiki')
                return response.read().decode('utf-8')
        except HTTPError:
            raise
        except (OSError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--url', default=DEFAULT)
    p.add_argument('--output')
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--all', action='store_true', help='Collect the catalog, resuming an existing snapshot')
    p.add_argument('--limit', type=int, help='Maximum number of character pages to attempt')
    p.add_argument('--delay', type=float, default=2, help='Seconds between pages (minimum 2)')
    p.add_argument('--catalog-file', type=Path, help='Use an existing catalog JSON list')
    args = p.parse_args()
    if args.all:
        if args.dry_run or args.delay < 2 or (args.limit is not None and args.limit < 1):
            p.error('--all requires delay >= 2, a positive limit, and cannot be combined with --dry-run')
        target = Path(args.output) if args.output else Path(__file__).resolve().parent / 'output' / 'all-shikigami.json'
        try:
            catalog_file = args.catalog_file or Path(__file__).resolve().parent / 'catalog-2026-11-26.json'
            completed = collect_all(target, args.limit, args.delay, catalog_file)
        except HTTPError as exc:
            print('Catalog: ' + http_message(exc), flush=True)
            raise SystemExit(1) from None
        except (OSError, ValueError, KeyError) as exc:
            print(f'Collection failed: {exc!a}', flush=True)
            raise SystemExit(1) from None
        if not completed:
            raise SystemExit(1)
        return
    result = extract(fetch(args.url), args.url)
    result['collected_at_utc'] = datetime.now(timezone.utc).isoformat()
    result['scope'] = 'single_page_review'
    result_json = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.dry_run:
        print(json.dumps(result, ensure_ascii=True, indent=2))
    else:
        target = Path(args.output) if args.output else Path(__file__).resolve().parent / 'output' / 'sample.json'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(result_json, encoding='utf-8')
        print(f'Saved {target}; warnings: {result["warnings"]}')


if __name__ == '__main__':
    main()
