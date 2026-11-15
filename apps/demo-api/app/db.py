"""Banco temporário (SQLite) e carga do seed. Descartável: só o contrato /api/v1 sobrevive."""

import json
import os
import re
import sqlite3
from datetime import UTC, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DB_PATH = Path(os.environ.get("DEMO_DB_PATH", ROOT / "apps/demo-api/demo.db"))
SEED_DIR = Path(os.environ.get("DEMO_SEED_DIR", ROOT / "seed"))
BRAZIL = timezone(timedelta(hours=-3))  # sem horário de verão desde 2019
TOKEN = re.compile(r"^@([dh])([+-]\d+)$")


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(DB_PATH)


def resolve(value):
    """Converte "@d-12" (data) e "@h-3" (instante) em valores reais, recursivamente."""
    if isinstance(value, str) and (m := TOKEN.match(value)):
        now = datetime.now(UTC).astimezone(BRAZIL)
        amount = int(m.group(2))
        if m.group(1) == "d":
            return (now.date() + timedelta(days=amount)).isoformat()
        return (now.replace(microsecond=0) + timedelta(hours=amount)).isoformat()
    if isinstance(value, list):
        return [resolve(v) for v in value]
    if isinstance(value, dict):
        return {k: resolve(v) for k, v in value.items()}
    return value


def seed_file(name: str):
    return json.loads((SEED_DIR / f"{name}.json").read_text(encoding="utf-8"))


def load() -> None:
    """Recria a tabela e carrega todas as coleções de seed/ (arquivos com "_" são roteiros)."""
    with connect() as conn:
        conn.execute("DROP TABLE IF EXISTS records")
        conn.execute("CREATE TABLE records (collection TEXT, id TEXT, data JSON, PRIMARY KEY (collection, id))")
        for path in sorted(SEED_DIR.glob("*.json")):
            if path.name.startswith("_"):
                continue
            rows = [
                (path.stem, r["id"], json.dumps(resolve(r), ensure_ascii=False))
                for r in json.loads(path.read_text(encoding="utf-8"))
            ]
            conn.executemany("INSERT INTO records VALUES (?, ?, ?)", rows)


def ensure() -> None:
    if not DB_PATH.exists():
        load()


def collections() -> set[str]:
    with connect() as conn:
        return {r[0] for r in conn.execute("SELECT DISTINCT collection FROM records")}


def all_of(collection: str) -> list[dict]:
    with connect() as conn:
        return [json.loads(r[0]) for r in conn.execute("SELECT data FROM records WHERE collection=?", (collection,))]


def get(collection: str, record_id: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT data FROM records WHERE collection=? AND id=?", (collection, record_id)).fetchone()
    return json.loads(row[0]) if row else None


def put(collection: str, record: dict) -> None:
    with connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO records VALUES (?, ?, ?)",
            (collection, record["id"], json.dumps(record, ensure_ascii=False)),
        )


def remove(collection: str, record_id: str) -> bool:
    with connect() as conn:
        return conn.execute("DELETE FROM records WHERE collection=? AND id=?", (collection, record_id)).rowcount > 0
