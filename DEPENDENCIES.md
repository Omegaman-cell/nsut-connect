# Complete project inventory

## Code and platform

- JavaScript (ES modules), JSX, TypeScript for the framework boundary/schema, HTML, CSS, SVG, JSON, SQL; Python; PowerShell launch/stop scripts.
- React function components with useState, useEffect and useRef. Hash navigation using the browser URL.
- Custom CSS, SVG icons/campus drawing, letter-based avatars. Google Fonts: DM Sans and Manrope; Georgia/Segoe UI/system fallbacks.
- Browser APIs: fetch, localStorage, structuredClone, URL/hash/history events, Intl/Date formatting, Blob/Object URLs for CSV, DOM events/focus, timers, online/offline status, matchMedia/device theme preference, service worker and Cache API, web app manifest.
- Storage: JSON file for local server edits; D1 SQLite for public records and hashed sessions; browser localStorage for display state/read markers/section choice/offline snapshots; Cache API for the public shell/assets.
- Authentication: Google Identity Services, jose JWT signature/claim verification, one-use login nonces, HttpOnly cookie sessions, same-origin write checks and server administrator allowlist. The retained Python backend uses Google tokeninfo and expiring bearer sessions.
- Hosting: OpenAI Sites Worker hosting with D1 SQLite; GitHub public source repository; Git for source/version control.

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

The UI and API remain JavaScript/JSX. The hosted framework boundary and schema use TypeScript. ESLint is configured but was not run as part of this task.

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
- Git and Git Credential Manager were used to push to the owner-authorized GitHub repository; Sites source helpers packaged and deployed the Worker build. Google Cloud was used to register the OAuth web client.
- No Claude/Opus model or Claude assets were used. The final design revision was informed by Linear’s designer-authored UI refresh, GitHub Discussions and a published article showing AI-built websites; no source or visual assets were copied. Icons and campus artwork are inline SVG.

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

## Public-server direct packages (installed lockfile versions)

| Package | Version | Purpose |
| --- | --- | --- |
| drizzle-orm | 0.45.2 | SQL schema declarations |
| jose | 6.2.12 | Google JWT verification |
| next | 16.3.4 | Vinext-compatible framework APIs |
| react | 19.2.6 | React UI |
| react-dom | 19.2.6 | React renderer |
| @cloudflare/vite-plugin | 1.37.1 | Worker build integration |
| @cloudflare/workers-types | 4.20260515.1 | Worker/D1 types |
| @types/node | 22.19.19 | Node editor types |
| @types/react | 19.2.14 | React editor types |
| @types/react-dom | 19.2.3 | React DOM editor types |
| @vitejs/plugin-react | 6.0.2 | React build integration |
| @vitejs/plugin-rsc | 0.5.26 | React server-component build support |
| drizzle-kit | 0.31.10 | Generate SQL migrations |
| json-rpc-2.0 | 1.7.1 | Bundled starter tooling |
| raw-body | 3.0.2 | Bundled starter tooling |
| react-server-dom-webpack | 19.2.6 | React server-component protocol |
| typescript | 5.9.3 | Framework/schema type checking |
| vinext | 1.0.0-beta.5 | Full-stack React framework for Workers |
| vite | 8.0.13 | Build tooling |
| wrangler | 4.92.0 | Local Worker/D1 preview |

## Public-server transitive package inventory

Generated from the installed pnpm dependency tree. `hosted/pnpm-lock.yaml` pins the complete dependency graph.

| Package | Version |
| --- | --- |
| @cloudflare/kv-asset-handler | 0.5.0 |
| @cloudflare/unenv-preset | 2.16.1 |
| @cloudflare/vite-plugin | 1.37.1 |
| @cloudflare/workerd-darwin-64 | 1.20260515.1 |
| @cloudflare/workerd-darwin-arm64 | 1.20260515.1 |
| @cloudflare/workerd-linux-64 | 1.20260515.1 |
| @cloudflare/workerd-linux-arm64 | 1.20260515.1 |
| @cloudflare/workerd-windows-64 | 1.20260515.1 |
| @cloudflare/workers-types | 4.20260515.1 |
| @cspotcode/source-map-support | 0.8.1 |
| @drizzle-team/brocli | 0.10.2 |
| @emnapi/core | 1.10.0 |
| @emnapi/runtime | 1.10.0 |
| @emnapi/runtime | 1.11.3 |
| @emnapi/wasi-threads | 1.2.1 |
| @esbuild-kit/core-utils | 3.3.2 |
| @esbuild-kit/esm-loader | 2.6.5 |
| @esbuild/aix-ppc64 | 0.25.12 |
| @esbuild/aix-ppc64 | 0.27.3 |
| @esbuild/aix-ppc64 | 0.28.2 |
| @esbuild/android-arm | 0.18.20 |
| @esbuild/android-arm | 0.25.12 |
| @esbuild/android-arm | 0.27.3 |
| @esbuild/android-arm | 0.28.2 |
| @esbuild/android-arm64 | 0.18.20 |
| @esbuild/android-arm64 | 0.25.12 |
| @esbuild/android-arm64 | 0.27.3 |
| @esbuild/android-arm64 | 0.28.2 |
| @esbuild/android-x64 | 0.18.20 |
| @esbuild/android-x64 | 0.25.12 |
| @esbuild/android-x64 | 0.27.3 |
| @esbuild/android-x64 | 0.28.2 |
| @esbuild/darwin-arm64 | 0.18.20 |
| @esbuild/darwin-arm64 | 0.25.12 |
| @esbuild/darwin-arm64 | 0.27.3 |
| @esbuild/darwin-arm64 | 0.28.2 |
| @esbuild/darwin-x64 | 0.18.20 |
| @esbuild/darwin-x64 | 0.25.12 |
| @esbuild/darwin-x64 | 0.27.3 |
| @esbuild/darwin-x64 | 0.28.2 |
| @esbuild/freebsd-arm64 | 0.18.20 |
| @esbuild/freebsd-arm64 | 0.25.12 |
| @esbuild/freebsd-arm64 | 0.27.3 |
| @esbuild/freebsd-arm64 | 0.28.2 |
| @esbuild/freebsd-x64 | 0.18.20 |
| @esbuild/freebsd-x64 | 0.25.12 |
| @esbuild/freebsd-x64 | 0.27.3 |
| @esbuild/freebsd-x64 | 0.28.2 |
| @esbuild/linux-arm | 0.18.20 |
| @esbuild/linux-arm | 0.25.12 |
| @esbuild/linux-arm | 0.27.3 |
| @esbuild/linux-arm | 0.28.2 |
| @esbuild/linux-arm64 | 0.18.20 |
| @esbuild/linux-arm64 | 0.25.12 |
| @esbuild/linux-arm64 | 0.27.3 |
| @esbuild/linux-arm64 | 0.28.2 |
| @esbuild/linux-ia32 | 0.18.20 |
| @esbuild/linux-ia32 | 0.25.12 |
| @esbuild/linux-ia32 | 0.27.3 |
| @esbuild/linux-ia32 | 0.28.2 |
| @esbuild/linux-loong64 | 0.18.20 |
| @esbuild/linux-loong64 | 0.25.12 |
| @esbuild/linux-loong64 | 0.27.3 |
| @esbuild/linux-loong64 | 0.28.2 |
| @esbuild/linux-mips64el | 0.18.20 |
| @esbuild/linux-mips64el | 0.25.12 |
| @esbuild/linux-mips64el | 0.27.3 |
| @esbuild/linux-mips64el | 0.28.2 |
| @esbuild/linux-ppc64 | 0.18.20 |
| @esbuild/linux-ppc64 | 0.25.12 |
| @esbuild/linux-ppc64 | 0.27.3 |
| @esbuild/linux-ppc64 | 0.28.2 |
| @esbuild/linux-riscv64 | 0.18.20 |
| @esbuild/linux-riscv64 | 0.25.12 |
| @esbuild/linux-riscv64 | 0.27.3 |
| @esbuild/linux-riscv64 | 0.28.2 |
| @esbuild/linux-s390x | 0.18.20 |
| @esbuild/linux-s390x | 0.25.12 |
| @esbuild/linux-s390x | 0.27.3 |
| @esbuild/linux-s390x | 0.28.2 |
| @esbuild/linux-x64 | 0.18.20 |
| @esbuild/linux-x64 | 0.25.12 |
| @esbuild/linux-x64 | 0.27.3 |
| @esbuild/linux-x64 | 0.28.2 |
| @esbuild/netbsd-arm64 | 0.25.12 |
| @esbuild/netbsd-arm64 | 0.27.3 |
| @esbuild/netbsd-arm64 | 0.28.2 |
| @esbuild/netbsd-x64 | 0.18.20 |
| @esbuild/netbsd-x64 | 0.25.12 |
| @esbuild/netbsd-x64 | 0.27.3 |
| @esbuild/netbsd-x64 | 0.28.2 |
| @esbuild/openbsd-arm64 | 0.25.12 |
| @esbuild/openbsd-arm64 | 0.27.3 |
| @esbuild/openbsd-arm64 | 0.28.2 |
| @esbuild/openbsd-x64 | 0.18.20 |
| @esbuild/openbsd-x64 | 0.25.12 |
| @esbuild/openbsd-x64 | 0.27.3 |
| @esbuild/openbsd-x64 | 0.28.2 |
| @esbuild/openharmony-arm64 | 0.25.12 |
| @esbuild/openharmony-arm64 | 0.27.3 |
| @esbuild/openharmony-arm64 | 0.28.2 |
| @esbuild/sunos-x64 | 0.18.20 |
| @esbuild/sunos-x64 | 0.25.12 |
| @esbuild/sunos-x64 | 0.27.3 |
| @esbuild/sunos-x64 | 0.28.2 |
| @esbuild/win32-arm64 | 0.18.20 |
| @esbuild/win32-arm64 | 0.25.12 |
| @esbuild/win32-arm64 | 0.27.3 |
| @esbuild/win32-arm64 | 0.28.2 |
| @esbuild/win32-ia32 | 0.18.20 |
| @esbuild/win32-ia32 | 0.25.12 |
| @esbuild/win32-ia32 | 0.27.3 |
| @esbuild/win32-ia32 | 0.28.2 |
| @esbuild/win32-x64 | 0.18.20 |
| @esbuild/win32-x64 | 0.25.12 |
| @esbuild/win32-x64 | 0.27.3 |
| @esbuild/win32-x64 | 0.28.2 |
| @img/colour | 1.1.0 |
| @img/sharp-darwin-arm64 | 0.34.5 |
| @img/sharp-darwin-arm64 | 0.35.5 |
| @img/sharp-darwin-x64 | 0.34.5 |
| @img/sharp-darwin-x64 | 0.35.5 |
| @img/sharp-freebsd-wasm32 | 0.35.5 |
| @img/sharp-libvips-darwin-arm64 | 1.2.4 |
| @img/sharp-libvips-darwin-arm64 | 1.3.4 |
| @img/sharp-libvips-darwin-x64 | 1.2.4 |
| @img/sharp-libvips-darwin-x64 | 1.3.4 |
| @img/sharp-libvips-linux-arm | 1.2.4 |
| @img/sharp-libvips-linux-arm | 1.3.4 |
| @img/sharp-libvips-linux-arm64 | 1.2.4 |
| @img/sharp-libvips-linux-arm64 | 1.3.4 |
| @img/sharp-libvips-linux-ppc64 | 1.2.4 |
| @img/sharp-libvips-linux-ppc64 | 1.3.4 |
| @img/sharp-libvips-linux-riscv64 | 1.2.4 |
| @img/sharp-libvips-linux-riscv64 | 1.3.4 |
| @img/sharp-libvips-linux-s390x | 1.2.4 |
| @img/sharp-libvips-linux-s390x | 1.3.4 |
| @img/sharp-libvips-linux-x64 | 1.2.4 |
| @img/sharp-libvips-linux-x64 | 1.3.4 |
| @img/sharp-libvips-linuxmusl-arm64 | 1.2.4 |
| @img/sharp-libvips-linuxmusl-arm64 | 1.3.4 |
| @img/sharp-libvips-linuxmusl-x64 | 1.2.4 |
| @img/sharp-libvips-linuxmusl-x64 | 1.3.4 |
| @img/sharp-linux-arm | 0.34.5 |
| @img/sharp-linux-arm | 0.35.5 |
| @img/sharp-linux-arm64 | 0.34.5 |
| @img/sharp-linux-arm64 | 0.35.5 |
| @img/sharp-linux-ppc64 | 0.34.5 |
| @img/sharp-linux-ppc64 | 0.35.5 |
| @img/sharp-linux-riscv64 | 0.34.5 |
| @img/sharp-linux-riscv64 | 0.35.5 |
| @img/sharp-linux-s390x | 0.34.5 |
| @img/sharp-linux-s390x | 0.35.5 |
| @img/sharp-linux-x64 | 0.34.5 |
| @img/sharp-linux-x64 | 0.35.5 |
| @img/sharp-linuxmusl-arm64 | 0.34.5 |
| @img/sharp-linuxmusl-arm64 | 0.35.5 |
| @img/sharp-linuxmusl-x64 | 0.34.5 |
| @img/sharp-linuxmusl-x64 | 0.35.5 |
| @img/sharp-wasm32 | 0.34.5 |
| @img/sharp-wasm32 | 0.35.5 |
| @img/sharp-webcontainers-wasm32 | 0.35.5 |
| @img/sharp-win32-arm64 | 0.34.5 |
| @img/sharp-win32-arm64 | 0.35.5 |
| @img/sharp-win32-ia32 | 0.34.5 |
| @img/sharp-win32-ia32 | 0.35.5 |
| @img/sharp-win32-x64 | 0.34.5 |
| @img/sharp-win32-x64 | 0.35.5 |
| @jridgewell/gen-mapping | 0.3.13 |
| @jridgewell/resolve-uri | 3.1.2 |
| @jridgewell/source-map | 0.3.11 |
| @jridgewell/sourcemap-codec | 1.6.0 |
| @jridgewell/trace-mapping | 0.3.31 |
| @jridgewell/trace-mapping | 0.3.9 |
| @napi-rs/wasm-runtime | 1.2.5 |
| @next/env | 16.3.4 |
| @next/swc-darwin-arm64 | 16.3.4 |
| @next/swc-darwin-x64 | 16.3.4 |
| @next/swc-linux-arm64-gnu | 16.3.4 |
| @next/swc-linux-arm64-musl | 16.3.4 |
| @next/swc-linux-x64-gnu | 16.3.4 |
| @next/swc-linux-x64-musl | 16.3.4 |
| @next/swc-win32-arm64-msvc | 16.3.4 |
| @next/swc-win32-x64-msvc | 16.3.4 |
| @nodelib/fs.scandir | 2.1.5 |
| @nodelib/fs.stat | 2.0.5 |
| @nodelib/fs.walk | 1.2.8 |
| @oxc-project/types | 0.130.0 |
| @poppinss/colors | 4.1.6 |
| @poppinss/dumper | 0.6.5 |
| @poppinss/exception | 1.2.3 |
| @resvg/resvg-wasm | 2.4.0 |
| @rolldown/binding-android-arm64 | 1.0.1 |
| @rolldown/binding-darwin-arm64 | 1.0.1 |
| @rolldown/binding-darwin-x64 | 1.0.1 |
| @rolldown/binding-freebsd-x64 | 1.0.1 |
| @rolldown/binding-linux-arm-gnueabihf | 1.0.1 |
| @rolldown/binding-linux-arm64-gnu | 1.0.1 |
| @rolldown/binding-linux-arm64-musl | 1.0.1 |
| @rolldown/binding-linux-ppc64-gnu | 1.0.1 |
| @rolldown/binding-linux-s390x-gnu | 1.0.1 |
| @rolldown/binding-linux-x64-gnu | 1.0.1 |
| @rolldown/binding-linux-x64-musl | 1.0.1 |
| @rolldown/binding-openharmony-arm64 | 1.0.1 |
| @rolldown/binding-wasm32-wasi | 1.0.1 |
| @rolldown/binding-win32-arm64-msvc | 1.0.1 |
| @rolldown/binding-win32-x64-msvc | 1.0.1 |
| @rolldown/pluginutils | 1.0.0-rc.18 |
| @rolldown/pluginutils | 1.0.1 |
| @shuding/opentype.js | 1.4.0-beta.0 |
| @sindresorhus/is | 7.2.0 |
| @speed-highlight/core | 1.2.24 |
| @swc/helpers | 0.5.23 |
| @tybys/wasm-util | 0.10.4 |
| @types/estree | 1.0.9 |
| @types/json-schema | 7.0.15 |
| @types/node | 22.19.19 |
| @types/react | 19.2.14 |
| @types/react-dom | 19.2.3 |
| @unpic/core | 1.0.3 |
| @unpic/react | 1.0.2 |
| @vercel/og | 0.8.6 |
| @vinext/types | 1.0.1 |
| @vitejs/plugin-react | 6.0.2 |
| @vitejs/plugin-rsc | 0.5.26 |
| @webassemblyjs/ast | 1.14.1 |
| @webassemblyjs/floating-point-hex-parser | 1.13.2 |
| @webassemblyjs/helper-api-error | 1.13.2 |
| @webassemblyjs/helper-buffer | 1.14.1 |
| @webassemblyjs/helper-numbers | 1.13.2 |
| @webassemblyjs/helper-wasm-bytecode | 1.13.2 |
| @webassemblyjs/helper-wasm-section | 1.14.1 |
| @webassemblyjs/ieee754 | 1.13.2 |
| @webassemblyjs/leb128 | 1.13.2 |
| @webassemblyjs/utf8 | 1.13.2 |
| @webassemblyjs/wasm-edit | 1.14.1 |
| @webassemblyjs/wasm-gen | 1.14.1 |
| @webassemblyjs/wasm-opt | 1.14.1 |
| @webassemblyjs/wasm-parser | 1.14.1 |
| @webassemblyjs/wast-printer | 1.14.1 |
| @xtuc/ieee754 | 1.2.0 |
| @xtuc/long | 4.2.2 |
| acorn | 8.19.0 |
| acorn-loose | 8.5.2 |
| ajv | 8.20.0 |
| ajv-formats | 3.0.1 |
| ajv-keywords | 5.1.0 |
| base64-js | 0.0.8 |
| baseline-browser-mapping | 2.11.28 |
| blake3-wasm | 2.1.5 |
| braces | 3.0.3 |
| browserslist | 4.29.3 |
| buffer-from | 1.1.2 |
| bytes | 3.1.2 |
| camelize | 1.0.1 |
| caniuse-lite | 1.0.30001815 |
| chrome-trace-event | 1.0.4 |
| client-only | 0.0.1 |
| color-name | 1.1.4 |
| commander | 2.20.3 |
| cookie | 1.1.1 |
| css-background-parser | 0.1.0 |
| css-box-shadow | 1.0.0-3 |
| css-color-keywords | 1.0.0 |
| css-gradient-parser | 0.0.16 |
| css-to-react-native | 3.2.0 |
| csstype | 3.2.3 |
| depd | 2.0.0 |
| detect-libc | 2.1.2 |
| drizzle-kit | 0.31.10 |
| drizzle-orm | 0.45.2 |
| electron-to-chromium | 1.5.452 |
| emoji-regex-xs | 2.0.1 |
| enhanced-resolve | 5.26.0 |
| error-stack-parser-es | 1.0.5 |
| es-module-lexer | 1.7.0 |
| es-module-lexer | 2.3.2 |
| esbuild | 0.18.20 |
| esbuild | 0.25.12 |
| esbuild | 0.27.3 |
| esbuild | 0.28.2 |
| escalade | 3.2.0 |
| escape-html | 1.0.3 |
| estree-walker | 3.0.3 |
| events | 3.3.0 |
| fast-deep-equal | 3.1.3 |
| fast-glob | 3.3.3 |
| fast-uri | 3.1.8 |
| fastq | 1.20.3 |
| fdir | 6.5.0 |
| fflate | 0.7.5 |
| fill-range | 7.1.1 |
| fsevents | 2.3.3 |
| get-tsconfig | 4.14.3 |
| glob-parent | 5.1.2 |
| graceful-fs | 4.2.11 |
| has-flag | 4.0.0 |
| hex-rgb | 4.3.0 |
| http-errors | 2.0.1 |
| iconv-lite | 0.7.3 |
| image-size | 2.0.2 |
| inherits | 2.0.4 |
| ipaddr.js | 2.5.0 |
| is-extglob | 2.1.1 |
| is-glob | 4.0.3 |
| is-number | 7.0.0 |
| jest-worker | 27.5.1 |
| jose | 6.2.12 |
| js-tokens | 9.0.1 |
| json-rpc-2.0 | 1.7.1 |
| json-schema-traverse | 1.0.0 |
| kleur | 4.1.5 |
| lightningcss | 1.33.0 |
| lightningcss-android-arm64 | 1.33.0 |
| lightningcss-darwin-arm64 | 1.33.0 |
| lightningcss-darwin-x64 | 1.33.0 |
| lightningcss-freebsd-x64 | 1.33.0 |
| lightningcss-linux-arm-gnueabihf | 1.33.0 |
| lightningcss-linux-arm64-gnu | 1.33.0 |
| lightningcss-linux-arm64-musl | 1.33.0 |
| lightningcss-linux-x64-gnu | 1.33.0 |
| lightningcss-linux-x64-musl | 1.33.0 |
| lightningcss-win32-arm64-msvc | 1.33.0 |
| lightningcss-win32-x64-msvc | 1.33.0 |
| linebreak | 1.1.0 |
| magic-string | 0.30.21 |
| merge-stream | 2.0.0 |
| merge2 | 1.4.1 |
| micromatch | 4.0.8 |
| mime-db | 1.54.0 |
| miniflare | 4.20260515.0 |
| minimizer-webpack-plugin | 5.13.0 |
| nanoid | 3.3.20 |
| neo-async | 2.6.2 |
| next | 16.3.4 |
| node-releases | 2.0.58 |
| pako | 0.2.9 |
| parse-css-color | 0.2.1 |
| path-to-regexp | 6.3.0 |
| pathe | 2.0.3 |
| picocolors | 1.1.1 |
| picomatch | 2.3.2 |
| picomatch | 4.0.7 |
| postcss | 8.5.23 |
| postcss | 8.5.29 |
| postcss-value-parser | 4.2.0 |
| queue-microtask | 1.2.3 |
| raw-body | 3.0.2 |
| react | 19.2.6 |
| react-dom | 19.2.6 |
| react-server-dom-webpack | 19.2.6 |
| require-from-string | 2.0.2 |
| resolve-pkg-maps | 1.0.0 |
| reusify | 1.1.0 |
| rolldown | 1.0.1 |
| run-parallel | 1.2.0 |
| safer-buffer | 2.1.2 |
| satori | 0.16.0 |
| scheduler | 0.27.0 |
| schema-utils | 4.5.0 |
| semver | 7.8.5 |
| setprototypeof | 1.2.0 |
| sharp | 0.34.5 |
| sharp | 0.35.5 |
| source-map | 0.6.1 |
| source-map-js | 1.2.2 |
| source-map-support | 0.5.21 |
| srvx | 0.11.22 |
| statuses | 2.0.2 |
| string.prototype.codepointat | 0.2.1 |
| strip-literal | 3.1.0 |
| styled-jsx | 5.1.6 |
| supports-color | 10.2.2 |
| supports-color | 8.1.1 |
| tapable | 2.3.3 |
| terser | 5.51.2 |
| tiny-inflate | 1.0.3 |
| tinyglobby | 0.2.17 |
| to-regex-range | 5.0.1 |
| toidentifier | 1.0.1 |
| tslib | 2.8.1 |
| tsx | 4.23.15 |
| turbo-stream | 3.2.1 |
| typescript | 5.9.3 |
| undici | 7.24.8 |
| undici-types | 6.21.0 |
| unenv | 2.0.0-rc.24 |
| unicode-trie | 2.0.0 |
| unpic | 4.2.2 |
| unpipe | 1.0.0 |
| update-browserslist-db | 1.3.4 |
| vinext | 1.0.0-beta.5 |
| vite | 8.0.13 |
| vite-plugin-commonjs | 0.10.4 |
| vite-plugin-dynamic-import | 1.6.0 |
| vitefu | 1.1.3 |
| watchpack | 2.5.2 |
| web-vitals | 4.2.4 |
| webpack | 5.111.1 |
| webpack-sources | 3.6.0 |
| workerd | 1.20260515.1 |
| wrangler | 4.92.0 |
| ws | 8.18.0 |
| yoga-layout | 3.2.1 |
| youch | 4.1.0-beta.10 |
| youch-core | 0.3.3 |
