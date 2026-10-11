# Complete project inventory

## Code and platform

- JavaScript (ES modules), JSX, HTML, CSS, SVG, JSON; Python; PowerShell launch/stop scripts.
- React function components with useState, useEffect and useRef. Hash navigation using the browser URL.
- Custom CSS, SVG icons/campus drawing, letter-based avatars. Google Fonts: DM Sans and Manrope; Georgia/Segoe UI/system fallbacks.
- Browser APIs: fetch, localStorage, structuredClone, URL/hash/history events, Intl/Date formatting, Blob/Object URLs for CSV, DOM events/focus, timers, online/offline status, service worker and Cache API, web app manifest.
- Storage: JSON file for local server edits; browser localStorage for public demo data/session/read markers/section choice/offline content; Cache API for offline assets.
- Authentication: local random bearer sessions with expiry; optional Google Identity Services in the UI and Google tokeninfo verification in Python; server administrator email allowlist.
- Hosting: OpenAI Sites static hosting (production infrastructure managed by Sites); GitHub public source repository; Git for source/version control.

## Direct frontend packages (resolved lockfile versions)

| Package | Version | Purpose |
| --- | --- | --- |
| react | 19.3.0 | UI components/hooks |
| react-dom | 19.3.0 | Mount/render React in the browser |
| @eslint/js | 10.0.1 | Base ESLint rules |
| @types/react | 19.3.0 | React editor type definitions |
| @types/react-dom | 19.3.0 | React DOM editor type definitions |
| @vitejs/plugin-react | 6.1.2 | React integration for Vite |
| eslint | 10.12.0 | Optional code linting |
| eslint-plugin-react-hooks | 7.1.1 | Hook lint rules |
| eslint-plugin-react-refresh | 0.5.7 | React refresh lint rules |
| globals | 17.13.0 | Known browser globals for lint configuration |
| vite | 8.3.4 | Dev server, API proxy and production build |

Type definition packages do not mean the app uses TypeScript; application source is JavaScript/JSX. ESLint is configured but was not run as part of this task.

## Backend libraries

- Direct requirements: FastAPI and Uvicorn. Tested installed versions: FastAPI 0.143.0, Uvicorn 0.54.0.
- Pydantic (2.14.0 tested) supplies BaseModel/Field validation; installed through FastAPI. Starlette (1.7.0 tested) supplies the ASGI foundation, CORS middleware and test client.
- HTTPX 0.28.1 is used by the FastAPI test client; required for tests, not an application API client.
- Python standard library used by the app/tests: copy, json, os, secrets, threading, urllib.request/error/parse, datetime, pathlib, tempfile, unittest.
- Exact fresh-install versions may vary within requirements.txt ranges. Backend transitive packages are managed by pip.

## Development tools used

- Codex authored and edited the code. Sites skill supplied the website/publishing workflow and design guidance; PDF skill supplied document inspection guidance.
- Node.js/Vite production build; Python unittest + FastAPI TestClient/HTTPX integration checks; Codex browser automation for desktop/mobile interaction checks; PowerShell launcher checks.
- Prettier 3.6.2 was downloaded temporarily to format source. It is not an app dependency and is not required to run the project.
- pdfplumber and its PDF renderer were used temporarily to read/render the supplied timetable. They are not app runtime dependencies.
- Git and Git Credential Manager were used to push to the owner-authorized GitHub repository; Sites source helpers packaged and deployed the static build.
- No Claude/Opus model, Claude assets, or Opus-designed website was used. Icons and campus artwork are inline SVG.

## Complete frontend transitive lockfile inventory

The following includes indirect and optional/platform-specific packages. Not every optional binary is installed on this Windows machine. package-lock.json is the authoritative reproducible list.

| Lockfile package path | Version |
| --- | --- |
| node_modules/@babel/code-frame | 7.29.7 |
| node_modules/@babel/compat-data | 7.29.7 |
| node_modules/@babel/core | 7.29.7 |
| node_modules/@babel/generator | 7.29.8 |
| node_modules/@babel/helper-compilation-targets | 7.29.7 |
| node_modules/@babel/helper-globals | 7.29.7 |
| node_modules/@babel/helper-module-imports | 7.29.7 |
| node_modules/@babel/helper-module-transforms | 7.29.7 |
| node_modules/@babel/helper-string-parser | 7.29.7 |
| node_modules/@babel/helper-validator-identifier | 7.29.7 |
| node_modules/@babel/helper-validator-option | 7.29.7 |
| node_modules/@babel/helpers | 7.29.10 |
| node_modules/@babel/parser | 7.29.9 |
| node_modules/@babel/template | 7.29.7 |
| node_modules/@babel/traverse | 7.29.10 |
| node_modules/@babel/types | 7.29.8 |
| node_modules/@cacheable/memory | 2.2.0 |
| node_modules/@cacheable/utils | 2.5.0 |
| node_modules/@eslint-community/eslint-utils | 4.10.1 |
| node_modules/@eslint-community/eslint-utils/node_modules/eslint-visitor-keys | 3.4.3 |
| node_modules/@eslint-community/regexpp | 4.12.2 |
| node_modules/@eslint/config-array | 0.23.5 |
| node_modules/@eslint/config-helpers | 0.7.0 |
| node_modules/@eslint/core | 1.2.1 |
| node_modules/@eslint/js | 10.0.1 |
| node_modules/@eslint/object-schema | 3.0.5 |
| node_modules/@eslint/plugin-kit | 0.7.3 |
| node_modules/@humanfs/core | 0.19.2 |
| node_modules/@humanfs/node | 0.16.8 |
| node_modules/@humanfs/types | 0.15.0 |
| node_modules/@humanwhocodes/module-importer | 1.0.1 |
| node_modules/@humanwhocodes/retry | 0.4.3 |
| node_modules/@jridgewell/gen-mapping | 0.3.13 |
| node_modules/@jridgewell/remapping | 2.3.5 |
| node_modules/@jridgewell/resolve-uri | 3.1.2 |
| node_modules/@jridgewell/sourcemap-codec | 1.6.0 |
| node_modules/@jridgewell/trace-mapping | 0.3.31 |
| node_modules/@keyv/bigmap | 1.3.1 |
| node_modules/@keyv/serialize | 1.1.1 |
| node_modules/@oxc-project/types | 0.153.0 |
| node_modules/@rolldown/binding-android-arm-eabi | 1.2.13 |
| node_modules/@rolldown/binding-android-arm64 | 1.2.13 |
| node_modules/@rolldown/binding-darwin-arm64 | 1.2.13 |
| node_modules/@rolldown/binding-darwin-x64 | 1.2.13 |
| node_modules/@rolldown/binding-freebsd-x64 | 1.2.13 |
| node_modules/@rolldown/binding-linux-arm-gnueabihf | 1.2.13 |
| node_modules/@rolldown/binding-linux-arm64-gnu | 1.2.13 |
| node_modules/@rolldown/binding-linux-arm64-musl | 1.2.13 |
| node_modules/@rolldown/binding-linux-ppc64-gnu | 1.2.13 |
| node_modules/@rolldown/binding-linux-s390x-gnu | 1.2.13 |
| node_modules/@rolldown/binding-linux-x64-gnu | 1.2.13 |
| node_modules/@rolldown/binding-linux-x64-musl | 1.2.13 |
| node_modules/@rolldown/binding-openharmony-arm64 | 1.2.13 |
| node_modules/@rolldown/binding-win32-arm64-msvc | 1.2.13 |
| node_modules/@rolldown/binding-win32-x64-msvc | 1.2.13 |
| node_modules/@rolldown/pluginutils | 1.0.1 |
| node_modules/@types/esrecurse | 4.3.1 |
| node_modules/@types/estree | 1.0.9 |
| node_modules/@types/json-schema | 7.0.15 |
| node_modules/@types/react | 19.3.0 |
| node_modules/@types/react-dom | 19.3.0 |
| node_modules/@vitejs/plugin-react | 6.1.2 |
| node_modules/acorn | 8.19.0 |
| node_modules/acorn-jsx | 5.3.2 |
| node_modules/ajv | 6.15.0 |
| node_modules/balanced-match | 4.0.4 |
| node_modules/baseline-browser-mapping | 2.11.28 |
| node_modules/brace-expansion | 5.0.12 |
| node_modules/browserslist | 4.29.3 |
| node_modules/cacheable | 2.5.0 |
| node_modules/caniuse-lite | 1.0.30001815 |
| node_modules/convert-source-map | 2.0.0 |
| node_modules/cross-spawn | 7.0.6 |
| node_modules/csstype | 3.2.3 |
| node_modules/debug | 4.4.3 |
| node_modules/deep-is | 0.1.4 |
| node_modules/detect-libc | 2.1.2 |
| node_modules/electron-to-chromium | 1.5.452 |
| node_modules/escalade | 3.2.0 |
| node_modules/escape-string-regexp | 4.0.0 |
| node_modules/eslint | 10.12.0 |
| node_modules/eslint-plugin-react-hooks | 7.1.1 |
| node_modules/eslint-plugin-react-refresh | 0.5.7 |
| node_modules/eslint-scope | 9.1.2 |
| node_modules/eslint-visitor-keys | 5.0.1 |
| node_modules/espree | 11.2.0 |
| node_modules/esquery | 1.7.0 |
| node_modules/esrecurse | 4.3.0 |
| node_modules/estraverse | 5.3.0 |
| node_modules/esutils | 2.0.3 |
| node_modules/fast-deep-equal | 3.1.3 |
| node_modules/fast-json-stable-stringify | 2.1.0 |
| node_modules/fast-levenshtein | 2.0.6 |
| node_modules/fdir | 6.5.0 |
| node_modules/file-entry-cache | 11.1.5 |
| node_modules/find-up | 5.0.0 |
| node_modules/flat-cache | 6.1.23 |
| node_modules/flatted | 3.4.4 |
| node_modules/fsevents | 2.3.3 |
| node_modules/gensync | 1.0.0-beta.2 |
| node_modules/glob-parent | 6.0.2 |
| node_modules/globals | 17.13.0 |
| node_modules/hashery | 1.5.1 |
| node_modules/hermes-estree | 0.25.1 |
| node_modules/hermes-parser | 0.25.1 |
| node_modules/hookified | 1.15.1 |
| node_modules/ignore | 5.3.2 |
| node_modules/imurmurhash | 0.1.4 |
| node_modules/is-extglob | 2.1.1 |
| node_modules/is-glob | 4.0.3 |
| node_modules/isexe | 2.0.0 |
| node_modules/js-tokens | 4.0.0 |
| node_modules/jsesc | 3.1.0 |
| node_modules/json-schema-traverse | 0.4.1 |
| node_modules/json-stable-stringify-without-jsonify | 1.0.1 |
| node_modules/json5 | 2.2.3 |
| node_modules/keyv | 5.6.0 |
| node_modules/levn | 0.4.1 |
| node_modules/lightningcss | 1.33.0 |
| node_modules/lightningcss-android-arm64 | 1.33.0 |
| node_modules/lightningcss-darwin-arm64 | 1.33.0 |
| node_modules/lightningcss-darwin-x64 | 1.33.0 |
| node_modules/lightningcss-freebsd-x64 | 1.33.0 |
| node_modules/lightningcss-linux-arm-gnueabihf | 1.33.0 |
| node_modules/lightningcss-linux-arm64-gnu | 1.33.0 |
| node_modules/lightningcss-linux-arm64-musl | 1.33.0 |
| node_modules/lightningcss-linux-x64-gnu | 1.33.0 |
| node_modules/lightningcss-linux-x64-musl | 1.33.0 |
| node_modules/lightningcss-win32-arm64-msvc | 1.33.0 |
| node_modules/lightningcss-win32-x64-msvc | 1.33.0 |
| node_modules/locate-path | 6.0.0 |
| node_modules/lru-cache | 5.1.1 |
| node_modules/minimatch | 10.2.6 |
| node_modules/ms | 2.1.3 |
| node_modules/nanoid | 3.3.20 |
| node_modules/natural-compare | 1.4.0 |
| node_modules/node-releases | 2.0.58 |
| node_modules/optionator | 0.9.4 |
| node_modules/p-limit | 3.1.0 |
| node_modules/p-locate | 5.0.0 |
| node_modules/path-exists | 4.0.0 |
| node_modules/path-key | 3.1.1 |
| node_modules/picocolors | 1.1.1 |
| node_modules/picomatch | 4.0.7 |
| node_modules/postcss | 8.5.29 |
| node_modules/prelude-ls | 1.2.1 |
| node_modules/punycode | 2.3.1 |
| node_modules/qified | 0.10.1 |
| node_modules/qified/node_modules/hookified | 2.2.0 |
| node_modules/react | 19.3.0 |
| node_modules/react-dom | 19.3.0 |
| node_modules/rolldown | 1.2.13 |
| node_modules/scheduler | 0.28.0 |
| node_modules/semver | 6.3.1 |
| node_modules/shebang-command | 2.0.0 |
| node_modules/shebang-regex | 3.0.0 |
| node_modules/source-map-js | 1.2.2 |
| node_modules/tinyglobby | 0.2.17 |
| node_modules/type-check | 0.4.0 |
| node_modules/update-browserslist-db | 1.3.4 |
| node_modules/uri-js | 4.4.1 |
| node_modules/vite | 8.3.4 |
| node_modules/which | 2.0.2 |
| node_modules/word-wrap | 1.2.5 |
| node_modules/yallist | 3.1.1 |
| node_modules/yocto-queue | 0.1.0 |
| node_modules/zod | 4.6.5 |
| node_modules/zod-validation-error | 4.0.2 |

## Installed backend dependency tree used in validation

Includes runtime packages and test-client dependencies. Optional extras are excluded.

| Package | Version |
| --- | --- |
| annotated-doc | 0.0.5 |
| annotated-types | 0.8.0 |
| anyio | 4.15.1 |
| certifi | 2026.7.22 |
| click | 8.5.0 |
| fastapi | 0.143.0 |
| h11 | 0.16.0 |
| httpcore | 1.0.9 |
| httpx | 0.28.1 |
| idna | 3.20 |
| opentelemetry-api | 1.45.1 |
| pydantic | 2.14.0 |
| pydantic-core | 2.50.0 |
| starlette | 1.7.0 |
| typing-extensions | 4.16.0 |
| typing-inspection | 0.4.4 |
| uvicorn | 0.54.0 |
