"""Verifica o contraste (WCAG) dos pares de texto do sistema nos dois temas. Uso: npm run brand:contrast"""

import json
import sys
from pathlib import Path

TOKENS = json.loads((Path(__file__).resolve().parents[2] / "brand/colors/tokens.json").read_text(encoding="utf-8"))["themes"]
PAIRS = [
    ("foreground", "background", 4.5), ("foreground", "surface", 4.5), ("muted-foreground", "background", 4.5), ("muted-foreground", "surface", 4.5),
    ("primary-foreground", "primary", 4.5), ("primary", "surface", 3.0), ("success-text", "success-soft", 4.5), ("warning-text", "warning-soft", 4.5),
    ("danger-text", "danger-soft", 4.5), ("sidebar-foreground", "sidebar", 4.5), ("sidebar-muted", "sidebar", 4.5), ("foreground", "primary-soft", 4.5),
]  # fmt: skip


def rgb(value: str, base: tuple[float, float, float]) -> tuple[float, float, float]:
    if value.startswith("#"):
        return tuple(int(value[i : i + 2], 16) / 255 for i in (1, 3, 5))  # type: ignore[return-value]
    r, g, b, *alpha = (float(n) for n in value.replace("/", " ").replace("rgb(", "").replace(")", "").split())
    a = alpha[0] if alpha else 1
    return tuple(c / 255 * a + base[i] * (1 - a) for i, c in enumerate((r, g, b)))  # type: ignore[return-value]


def luminance(c: tuple[float, float, float]) -> float:
    lin = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def main() -> int:
    failures = 0
    for theme, values in TOKENS.items():
        base = rgb(values["background"], (1, 1, 1))
        for fg, bg, minimum in PAIRS:
            back = rgb(values[bg], base)
            front = rgb(values[fg], back)
            la, lb = sorted((luminance(front), luminance(back)), reverse=True)
            ratio = (la + 0.05) / (lb + 0.05)
            if ratio < minimum:
                failures += 1
                print(f"FALHA {theme}: {fg} sobre {bg} = {ratio:.2f} (mínimo {minimum})")
    print("Contraste verificado." if not failures else f"{failures} par(es) abaixo do mínimo.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
