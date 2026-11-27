import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


spec = importlib.util.spec_from_file_location("import_data", Path(__file__).parents[1] / "scripts" / "import_data.py")
import_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(import_data)


class ImportSkillsTest(unittest.TestCase):
    def snapshot(self, root, skills):
        files = {
            "thuc_than_details_raw.json": [{"id": 1, "detail": {"id": 1, "skills": skills}}],
            "thuc_than_catalog_raw.json": {"count": 1, "heroes": [{"id": 1}]},
            "ngu_hon_raw.json": {"count": 0, "souls": []},
            "glossary_raw.json": [],
        }
        for name, value in files.items():
            (root / name).write_text(json.dumps(value), encoding="utf-8")

    def test_variable_skill_count(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.snapshot(root, [{"name": "A"}, {"name": "B"}])
            _, records, _, _, metadata = import_data.prepare(root)
            self.assertEqual(len(records["1"]["skills"]), 2)
            self.assertEqual(metadata["skillCount"], 2)

    def test_invalid_skill_structure_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for skills in (None, "bad", [None], [{}]):
                self.snapshot(root, skills)
                with self.assertRaisesRegex(ValueError, "invalid skills"):
                    import_data.prepare(root)


if __name__ == "__main__":
    unittest.main()
