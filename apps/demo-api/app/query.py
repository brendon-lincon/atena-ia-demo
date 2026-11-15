"""Filtro, busca, ordenação e paginação sobre o JSON dos registros."""

import json
import unicodedata


def fold(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if unicodedata.category(c) != "Mn")


def dig(record: dict, path: str):
    value = record
    for part in path.split("."):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def matches(record: dict, field: str, expected: str) -> bool:
    options = expected.split(",")
    value = dig(record, field)
    if isinstance(value, list):
        return any(str(v) in options for v in value)
    if isinstance(value, bool):
        return str(value).lower() in options
    return str(value) in options


def run(records: list[dict], params: dict[str, str]) -> tuple[list[dict], int, int, int]:
    for key, expected in params.items():
        if key.startswith("filter[") and key.endswith("]"):
            records = [r for r in records if matches(r, key[7:-1], expected)]
    if q := params.get("q"):
        needle = fold(q)
        records = [r for r in records if needle in fold(json.dumps(r, ensure_ascii=False))]
    for key in reversed([k for k in params.get("sort", "").split(",") if k]):
        field, reverse = (key[1:], True) if key.startswith("-") else (key, False)
        records = sorted(
            records,
            key=lambda r, f=field: (dig(r, f) is None, dig(r, f) if dig(r, f) is not None else ""),
            reverse=reverse,
        )
    total = len(records)
    page, size = max(int(params.get("page", 1)), 1), min(max(int(params.get("pageSize", 50)), 1), 500)
    return records[(page - 1) * size : page * size], total, page, size
