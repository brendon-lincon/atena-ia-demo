"""Recria o banco temporário a partir de seed/. Uso: npm run seed"""

from . import db

if __name__ == "__main__":
    db.load()
    print(f"Banco recriado em {db.DB_PATH}")
