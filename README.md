# Editor.js Link Block Tune

A [Block Tune](https://editorjs.io/block-tunes-api/) for [Editor.js](https://editor.js.org/) that lets you associate a link with any block. When a link is set, the block content is wrapped in an anchor so the whole block becomes clickable.

## Requirements

- Editor.js **v2.22.0** or higher

## Installation

### NPM

```bash
npm install editorjs-link-blocktune
```

```javascript
const LinkBlockTune = require('editorjs-link-blocktune');
```

### From source

1. Clone or download this repo.
2. Copy the `dist` folder into your project and include `dist/bundle.js`.

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/editorjs-link-blocktune@latest"></script>
```

## Usage

Register the tune in your Editor.js config and attach it to tools via `tunes`:

```javascript
import EditorJS from '@editorjs/editorjs';
import LinkBlockTune from 'editorjs-link-blocktune';

const editor = new EditorJS({
  tools: {
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      tunes: ['linkTune'],
    },
    header: {
      class: Header,
      inlineToolbar: true,
      tunes: ['linkTune'],
    },
    linkTune: {
      class: LinkBlockTune,
      config: {
        label: 'Add link',
        icon: '🔗',
      },
    },
  },
});
```

## Config

| Field  | Type   | Description                    |
|--------|--------|--------------------------------|
| label  | string | Tooltip text for the tune btn  |
| icon   | string | Icon (emoji or HTML) for menu  |

## Saved data

The tune saves with the block:

- `url` (string) – The URL associated with the block. Empty string when no link is set.

## Development

```bash
npm install
npm run build        # production build → dist/bundle.js
npm run build:dev   # development build with watch
```

Open `example/index.html` in a browser to try the tune (after `npm run build`).

## Block Tunes API

This plugin implements the [Block Tunes API](https://editorjs.io/block-tunes-api/):

- **Required:** `static get isTune()` → `true`, `render()`.
- **Optional:** `save()`, `wrap(blockContent)`, `static prepare(config)`, `static reset()`.

Constructor receives `{ api, data, config, block }`.

## License

MIT
