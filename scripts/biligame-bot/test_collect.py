import importlib.util
import unittest
import tempfile
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('collect', Path(__file__).with_name('collect.py'))
collect = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collect)


class ExtractionTest(unittest.TestCase):
    def test_catalog_deduplicates_links_and_uses_row_metadata(self):
        html = '<table><tr class="divsort" data-tjtname="A" data-paramxyd="SP"><td><a title="A" href="/yys/A">A</a><a title="A" href="/yys/A">A</a></td></tr></table>'
        self.assertEqual(collect.catalog_entries(html), [{'name_zh': 'A', 'rarity': 'SP', 'url': 'https://wiki.biligame.com/yys/A'}])

    def test_stop_and_resume_after_http_error(self):
        catalog = '<tr class="divsort" data-tjtname="A"><td><a title="A" href="/yys/A">A</a></td></tr>'
        page = '<div class="role-card"><div class="role-card__title">A</div></div>'
        error = HTTPError('https://wiki.biligame.com/yys/A', 567, 'blocked', {}, None)
        with tempfile.TemporaryDirectory() as tmp, patch.object(collect.time, 'sleep'):
            target = Path(tmp) / 'snapshot.json'
            with patch.object(collect, 'fetch', side_effect=[catalog, error]):
                self.assertFalse(collect.collect_all(target))
            with patch.object(collect, 'fetch', return_value=page) as fetch:
                self.assertTrue(collect.collect_all(target))
                fetch.assert_called_once_with('https://wiki.biligame.com/yys/A')

    def test_tabs_and_video_part(self):
        html = '''<div class="role-card"><div class="role-card__title">A</div>
        <div class="role-card__intro-content"><p>Hello <b>world</b></p></div>
        <div class="tabbertab" title="Default"><img src="/small" srcset="/small 1x, /full 2x"></div>
        <div class="tabbertab" title="Skin"><img src="/skin"></div></div>
        <div id="tab_pane_召唤动画"><script>var val1 = ``; var val2 = ``;
        const bv = `BV1TC4y1d732`; const p = `176` || '1';</script></div>'''
        result = collect.extract(html, 'https://wiki.biligame.com/yys/A')
        self.assertEqual(result['introduction_zh'], 'Hello world')
        self.assertEqual([s['name_zh'] for s in result['skins']], ['Default', 'Skin'])
        self.assertEqual(result['skins'][0]['image_url'], 'https://wiki.biligame.com/full')
        self.assertEqual(result['summon_video']['url'], 'https://www.bilibili.com/video/BV1TC4y1d732?p=176')
        self.assertEqual(result['warnings'], [])

    def test_unknown_video_mode_is_not_guessed(self):
        html = '<div class="role-card"></div><div id="tab_pane_召唤动画"><script>var val1 = `2`; var val2 = ``; const bv = `BV1TC4y1d732`; const p = `176`;</script></div>'
        result = collect.extract(html, 'https://wiki.biligame.com/yys/A')
        self.assertIsNone(result['summon_video']['url'])
        self.assertIn('summon_video_unrecognized', result['warnings'])


if __name__ == '__main__':
    unittest.main()
