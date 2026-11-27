"""Convert a user-supplied snapshot to versioned, static website JSON."""
import argparse
import hashlib
import json
import logging
from pathlib import Path

LOG = logging.getLogger("import_data")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def number(value):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return value
    try:
        parsed = float(str(value).strip().replace("%", "").replace(",", ""))
        return int(parsed) if parsed.is_integer() else parsed
    except ValueError:
        return None


def prepare(source):
    raw = read_json(source / "thuc_than_details_raw.json")
    souls = read_json(source / "ngu_hon_raw.json")
    glossary = read_json(source / "glossary_raw.json")
    catalog = read_json(source / "thuc_than_catalog_raw.json")
    if len(raw) != catalog["count"] or len(souls["souls"]) != souls["count"]:
        raise ValueError("Source counts do not match the supplied index")
    ids = [str(x["id"]) for x in raw]
    if len(set(ids)) != len(ids) or set(ids) != {str(x['id']) for x in catalog['heroes']}:
        raise ValueError("Duplicate or missing hero IDs")
    records, index = {}, []
    for entry in raw:
        detail = entry.get("detail")
        if not detail or str(detail["id"]) != str(entry["id"]):
            raise ValueError(f"Missing or mismatched detail: {entry['id']}")
        skills = detail.get("skills")
        if not isinstance(skills, list) or any(not isinstance(skill, dict) or not skill for skill in skills):
            raise ValueError(f"Missing or invalid skills: {entry['id']}")
        hero_id = str(entry["id"])
        stat = {x["key"]: {"value": number(x.get("value")), "grade": x.get("grade") or None,
                            "unit": "percent" if x["key"] == "crit" else "flat"}
                for x in detail.get("stats", [])}
        for key, val in detail.get("secondaryStats", {}).items():
            stat[key] = {"value": number(val), "grade": None, "unit": "percent"}
        record = {"id": hero_id, "name": detail.get("name", {}), "rarity": detail.get("rarity"),
                  "tier": detail.get("tier"), "sex": detail.get("sex"), "level": detail.get("level"),
                  "maxLevel": detail.get("maxLevel"), "statState": detail.get("statState"),
                  "reviewStatus": detail.get("reviewStatus"), "stats": stat,
                  "skills": skills, "assets": detail.get("assets", {}),
                  "source": {"name": "Bộ dữ liệu do người dùng cung cấp từ thucthanluc.io.vn",
                             "url": f"https://thucthanluc.io.vn/?hero={hero_id}",
                             "status": "unverified_snapshot"}}
        records[hero_id] = record
        index.append({k: record[k] for k in ("id", "name", "rarity", "tier", "sex", "level", "stats", "assets")})
    skill_count = sum(len(record["skills"]) for record in records.values())
    metadata = {"schema": 1, "heroCount": len(index), "skillCount": skill_count,
                "soulCount": len(souls["souls"]), "glossaryCount": len(glossary),
                "source": "user_supplied_scraped_snapshot", "verified": False,
                "inputHashes": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in
                                (source / "thuc_than_details_raw.json", source / "thuc_than_catalog_raw.json",
                                 source / "ngu_hon_raw.json", source / "glossary_raw.json")}}
    return index, records, souls["souls"], glossary, metadata


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    index, records, souls, glossary, meta = prepare(args.source)
    if not args.dry_run:
        write_json(args.output / "shikigami-catalog.json", {"schema": 1, "heroes": index})
        for hero_id, record in records.items():
            write_json(args.output / "shikigami" / f"{hero_id}.json", record)
        write_json(args.output / "souls.json", {"schema": 1, "souls": souls})
        write_json(args.output / "glossary.json", glossary)
        write_json(args.output / "manifest.json", meta)
    LOG.info("%s: %s heroes, %s skills, %s souls, %s glossary entries", "DRY RUN" if args.dry_run else "Imported", len(index), meta["skillCount"], len(souls), len(glossary))


if __name__ == "__main__":
    main()
