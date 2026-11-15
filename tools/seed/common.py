"""Utilitários do gerador de seed: ids estáveis, datas relativas e gravação.

Datas: "@d-12" = data (AAAA-MM-DD) 12 dias antes de hoje; "@h-3" = instante 3 horas antes de agora.
A conversão acontece no carregamento da API, então a demonstração nunca fica velha.
"""

import json
import random
import unicodedata
import uuid
from pathlib import Path

NAMESPACE = uuid.UUID("5f0e1a9c-3c52-4f0e-9a52-0a7e0a7e0a7e")
OUT = Path(__file__).resolve().parents[2] / "seed"
rng = random.Random(20261114)
_store: dict[str, list[dict]] = {}


def slug(text: str) -> str:
    """Minúsculas sem acentos, para e-mails e identificadores legíveis."""
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if unicodedata.category(c) != "Mn")


def uid(key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, key))


def d(days: int) -> str:
    return f"@d{days:+d}"


def h(hours: int) -> str:
    return f"@h{hours:+d}"


def brl(value: float) -> int:
    """Reais para centavos inteiros."""
    return round(value * 100)


def add(collection: str, key: str, **fields) -> str:
    """Cria um registro com id estável derivado de `key` e devolve o id."""
    record = {"id": uid(key), **fields}
    created = record.setdefault("createdAt", h(-24 * rng.randint(2, 90)))
    record.setdefault("updatedAt", created)
    _store.setdefault(collection, []).append(record)
    return record["id"]


def rows(collection: str) -> list[dict]:
    return _store.setdefault(collection, [])


def by_id(collection: str, record_id: str) -> dict:
    return next(r for r in rows(collection) if r["id"] == record_id)


def clean() -> None:
    OUT.mkdir(exist_ok=True)
    for old in OUT.glob("*.json"):
        old.unlink()


def write_all() -> None:
    for name, items in _store.items():
        (OUT / f"{name}.json").write_text(
            json.dumps(items, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
        )


def write_script(name: str, payload) -> None:
    (OUT / f"{name}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8"
    )


def pick(options: list):
    return rng.choice(options)
