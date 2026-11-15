"""Gerador dos arquivos de seed. Uso: npm run seed:build

A ordem importa: módulos posteriores leem registros dos anteriores (ex.: custos leem as obras).
"""

import importlib

from .common import clean, write_all

MODULES = ["core_data", "works", "field", "engineering", "business", "people", "comms", "knowledge", "system", "assets", "checks"]


def main() -> None:
    clean()
    for name in MODULES:
        importlib.import_module(f"tools.seed.{name}").build()
    write_all()


if __name__ == "__main__":
    main()
