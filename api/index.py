"""Ponto de entrada da API de demonstração como função Python (opção A de publicação).

O SQLite é recriado em diretório temporário a cada inicialização a frio: os dados voltam
ao estado inicial, o que é aceitável na demonstração.
"""

import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps" / "demo-api"))
os.environ.setdefault("DEMO_DB_PATH", str(Path(tempfile.gettempdir()) / "atena-demo.db"))
os.environ.setdefault("DEMO_SEED_DIR", str(ROOT / "seed"))

from app.main import app  # noqa: E402

__all__ = ["app"]
