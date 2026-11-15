"""Gera os tokens do front-end a partir de brand/colors/tokens.json e publica fontes e ícones em apps/web/public.

Uso: npm run brand:tokens
"""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BRAND = ROOT / "brand"
DESIGN = ROOT / "apps/web/src/design"
PUBLIC = ROOT / "apps/web/public"
SEMANTIC_UTILITIES = [
    "background", "surface", "elevated", "muted", "border", "foreground", "muted-foreground", "primary", "primary-foreground",
    "primary-strong", "primary-soft", "ring", "success", "success-soft", "success-text", "warning", "warning-soft", "warning-text",
    "danger", "danger-soft", "danger-text", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "atena-from", "atena-to",
    "sidebar", "sidebar-foreground", "sidebar-muted", "sidebar-active", "paper", "paper-foreground", "paper-muted", "paper-border",
]  # fmt: skip
FONTS = [
    ("Inter", "normal", "Inter-roman-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"),
    ("Inter", "normal", "Inter-roman-latin-ext.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"),
    ("Inter", "italic", "Inter-italic-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"),
    ("Inter", "italic", "Inter-italic-latin-ext.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"),
    ("JetBrains Mono", "normal", "JetBrainsMono-roman-latin.woff2", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"),
    ("JetBrains Mono", "normal", "JetBrainsMono-roman-latin-ext.woff2", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"),
]  # fmt: skip


def theme_block(values: dict[str, str]) -> str:
    return "\n".join(f"  --{key}: {value};" for key, value in values.items())


def css(tokens: dict) -> str:
    light, dark = tokens["themes"]["light"], tokens["themes"]["dark"]
    motion = tokens["motion"]
    ease = ",".join(str(n) for n in motion["easing"])
    shadows = (
        "  --shadow-sm: 0 1px 2px rgb(var(--shadow-color) / 0.06), 0 1px 1px rgb(var(--shadow-color) / 0.04);\n"
        "  --shadow-md: 0 4px 12px rgb(var(--shadow-color) / 0.08), 0 1px 3px rgb(var(--shadow-color) / 0.06);\n"
        "  --shadow-lg: 0 16px 40px rgb(var(--shadow-color) / 0.16), 0 4px 12px rgb(var(--shadow-color) / 0.08);"
    )
    utilities = "\n".join(f"  --color-{name}: var(--{name});" for name in SEMANTIC_UTILITIES)
    sizes = "\n".join(f"  --text-{k}: {v[0]};\n  --text-{k}--line-height: {v[1]};" for k, v in tokens["text"].items())
    radius = "\n".join(f"  --radius-{k}: {v};" for k, v in tokens["radius"].items())
    gradients = "\n".join(f"  --gradient-{k}: linear-gradient(135deg, {v[0]}, {v[1]});" for k, v in tokens["gradients"].items())
    durations = "\n".join(f"  --duration-{k}: {v}ms;" for k, v in motion["duration"].items())
    return f"""/* GERADO por tools/brand/build_tokens.py a partir de brand/colors/tokens.json. Não edite à mão. */

:root {{
{theme_block(light)}
{shadows}
{gradients}
{durations}
  --ease-standard: cubic-bezier({ease});
  --font-sans-stack: {tokens["font"]["sans"]};
  --font-mono-stack: {tokens["font"]["mono"]};
  color-scheme: light;
}}

@media (prefers-color-scheme: dark) {{
  :root:not([data-theme='light']) {{
{theme_block(dark)}
    color-scheme: dark;
  }}
}}

:root[data-theme='dark'] {{
{theme_block(dark)}
  color-scheme: dark;
}}

@theme inline {{
{utilities}
  --font-sans: var(--font-sans-stack);
  --font-mono: var(--font-mono-stack);
{sizes}
{radius}
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --ease-standard: var(--ease-standard);
}}
"""


def fonts_css() -> str:
    blocks = []
    for family, style, file, ranges in FONTS:
        blocks.append(
            f"@font-face {{\n  font-family: '{family}';\n  font-style: {style};\n  font-weight: 100 900;\n  font-display: swap;\n"
            f"  src: url('/fonts/{file}') format('woff2');\n  unicode-range: {ranges};\n}}"
        )
    return "/* GERADO por tools/brand/build_tokens.py. As fontes vêm de brand/typography (licença SIL OFL). */\n\n" + "\n\n".join(blocks) + "\n"


def motion_ts(tokens: dict) -> str:
    m = tokens["motion"]
    seconds = {k: v / 1000 for k, v in m["duration"].items()}
    return (
        "// GERADO por tools/brand/build_tokens.py a partir de brand/colors/tokens.json. Não edite à mão.\n\n"
        f"export const duration = {json.dumps(seconds)} as const;\n"
        f"export const easing = {json.dumps(m['easing'])} as const;\n"
        f"export const spring = {{ type: 'spring', stiffness: {m['spring']['stiffness']}, damping: {m['spring']['damping']} }} as const;\n"
        f"export const stagger = {m['stagger'] / 1000};\n"
        f"export const shift = {m['shift']};\n"
        f"export const chartColors = {json.dumps([f'var(--chart-{i})' for i in range(1, 6)])} as const;\n"
    )


def main() -> None:
    tokens = json.loads((BRAND / "colors/tokens.json").read_text(encoding="utf-8"))
    DESIGN.mkdir(parents=True, exist_ok=True)
    (DESIGN / "tokens.css").write_text(css(tokens), encoding="utf-8")
    (DESIGN / "fonts.css").write_text(fonts_css(), encoding="utf-8")
    (DESIGN / "motion.generated.ts").write_text(motion_ts(tokens), encoding="utf-8")
    fonts = PUBLIC / "fonts"
    fonts.mkdir(parents=True, exist_ok=True)
    for _, _, file, _ in FONTS:
        source = next(BRAND.glob(f"typography/*/{file}"))
        shutil.copy2(source, fonts / file)
    print("Tokens, fontes e movimento gerados.")


if __name__ == "__main__":
    main()
