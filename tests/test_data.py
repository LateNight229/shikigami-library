"""Checks the exported, deployable dataset without requiring the original CSVs."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


class DatasetTests(unittest.TestCase):
    def test_manifest_and_relationships(self):
        manifest = load(DATA / "manifest.json")
        heroes = load(DATA / "shikigami-catalog.json")["heroes"]
        souls = load(DATA / "souls.json")["souls"]
        ids = [h["id"] for h in heroes]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(ids), manifest["heroCount"])
        self.assertEqual(len(souls), manifest["soulCount"])
        self.assertEqual(len({str(s["id"]) for s in souls}), len(souls))
        records = [load(DATA / "shikigami" / f"{i}.json") for i in ids]
        self.assertEqual(sum(len(r["skills"]) for r in records), manifest["skillCount"])
        for item in records:
            self.assertTrue(item["id"].isdigit())
            for key in ("atk", "hp", "def", "speed", "crit"):
                self.assertIsInstance(item["stats"][key]["value"], (int, float))
            self.assertEqual(item["stats"]["crit"]["unit"], "percent")
        self.assertEqual(len(load(DATA / "glossary.json")), manifest["glossaryCount"])

    def test_susabi_skills_and_sortable_stats(self):
        hero = load(DATA / "shikigami" / "390.json")
        self.assertEqual(hero["stats"]["atk"]["value"], 3672)
        self.assertEqual(hero["stats"]["atk"]["grade"], "SS")
        self.assertEqual([s["id"] for s in hero["skills"]], [3901, 3902, 3903])
        self.assertEqual(len(hero["skills"][1]["upgrades"]), 4)


if __name__ == "__main__":
    unittest.main()
