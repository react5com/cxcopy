# cxcopy

Tiny cross-platform folder copy command-line utility (CLI) with watch mode.

## Install

```bash
npm install cxcopy --save-dev
```

## Usage

```bash
cxcopy <source> <destination> [--watch|-w] [--verbose|-v]
```

## Example

```bash
npx cxcopy src/assets dist --watch --verbose
```
or
```json
"scripts": {
  "build:assets": "cxcopy src/assets dist",
  "dev:assets": "cxcopy src/assets dist -w -v",
}
```