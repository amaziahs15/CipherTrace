"""
Tamper-evident audit log for CipherTrace predictions.
Entries stored as newline-delimited JSON with a SHA-256 hash chain.
Log file: audit_log.jsonl (same directory as this file)
"""
import hashlib
import json
import os
from datetime import datetime, timezone

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audit_log.jsonl")


def _hash(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _last_hash() -> str:
    if not os.path.exists(LOG_FILE):
        return "GENESIS"
    last_line = ""
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if s:
                last_line = s
    if not last_line:
        return "GENESIS"
    try:
        return json.loads(last_line).get("entry_hash", "GENESIS")
    except (json.JSONDecodeError, KeyError):
        return _hash(last_line)


def log_prediction(input_record: dict, output_record: dict) -> None:
    prev_hash = _last_hash()
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "input":     input_record,
        "output":    output_record,
        "prev_hash": prev_hash,
    }
    entry["entry_hash"] = _hash(json.dumps(entry, sort_keys=True))
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def read_last_n(n: int = 20) -> list:
    if not os.path.exists(LOG_FILE):
        return []
    lines = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if s:
                lines.append(s)
    result = []
    for line in lines[-n:]:
        try:
            result.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return result


def verify_chain() -> dict:
    if not os.path.exists(LOG_FILE):
        return {"valid": True, "entries_checked": 0, "message": "Log is empty."}
    entries = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if s:
                try:
                    entries.append(json.loads(s))
                except json.JSONDecodeError:
                    pass
    for i, entry in enumerate(entries):
        stored = entry.pop("entry_hash", None)
        computed = _hash(json.dumps(entry, sort_keys=True))
        entry["entry_hash"] = stored
        if stored != computed:
            return {"valid": False, "first_broken_at": i,
                    "message": "Hash mismatch at entry {}".format(i)}
        if i > 0 and entry.get("prev_hash") != entries[i - 1]["entry_hash"]:
            return {"valid": False, "first_broken_at": i,
                    "message": "Chain link broken at entry {}".format(i)}
    return {"valid": True, "entries_checked": len(entries),
            "message": "All {} entries verified - chain intact.".format(len(entries))}
