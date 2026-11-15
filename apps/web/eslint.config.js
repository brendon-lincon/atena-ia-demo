import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const root = fileURLToPath(new URL('.', import.meta.url));
const modulesDir = join(root, 'src/modules');

/** Lista os módulos como `area/modulo` a partir das pastas em src/modules. */
function listModules() {
  if (!existsSync(modulesDir)) return [];
  return readdirSync(modulesDir, { withFileTypes: true })
    .filter((area) => area.isDirectory())
    .flatMap((area) =>
      readdirSync(join(modulesDir, area.name), { withFileTypes: true })
        .filter((mod) => mod.isDirectory())
        .map((mod) => `${area.name}/${mod.name}`),
    );
}

const message = {
  crossModule: 'Módulo não importa de outro módulo: use core/, design/ ou contribuições.',
  relative: 'Dentro de módulos use o alias @/ (importação relativa só com "./").',
  layer: 'Camada inferior não importa de módulos nem da casca.',
};

/** Regra 3 do manual: um módulo só enxerga core/ e design/ (e a si mesmo). */
const moduleBoundaryConfigs = listModules().map((id) => ({
  files: [`src/modules/${id}/**/*.{ts,tsx}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { regex: `^@/modules/(?!${id}(/|$))`, message: message.crossModule },
          { group: ['@/app/**'], message: message.layer },
          { group: ['../*'], message: message.relative },
        ],
      },
    ],
  },
}));

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { projectService: true, tsconfigRootDir: root },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Cores vêm de tokens (variáveis CSS), nunca fixas no código.',
        },
        {
          selector: 'JSXText[value=/[A-Za-zÀ-ÿ]{2,}/]',
          message: 'Textos visíveis vêm do dicionário (core/i18n).',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|placeholder|title|alt)$/] > Literal[value=/\\S/]',
          message: 'Textos visíveis vêm do dicionário (core/i18n).',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Dados só pelo cliente da API (core/api).' },
        {
          name: 'localStorage',
          message: 'Use core/preferences (apenas preferências de interface).',
        },
        { name: 'sessionStorage', message: 'Use core/preferences.' },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}', 'src/design/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/modules/**', '@/app/**'], message: message.layer }] },
      ],
    },
  },
  ...moduleBoundaryConfigs,
  {
    files: ['src/core/api/**/*.ts'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['src/core/preferences/**/*.ts'],
    rules: { 'no-restricted-globals': ['error', { name: 'fetch', message: 'Use core/api.' }] },
  },
  {
    files: ['eslint.config.js', 'vite.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
);
