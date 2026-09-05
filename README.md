# dsh-client-ui-pet

A small animated **pet** that floats in the bottom-right corner of the [DeepSeek Harness](https://deepseek.ai) web chat UI.

A `dsh.client` client plugin (`platform: web`): it mounts a cute, bobbing, draggable character into the frame-wide **`shell.overlay`** slot, greeting you with a little speech bubble when it first appears.

![pet](https://img.shields.io/badge/status-working-2ecc71)

## Features

- 🐱 Floating bottom-right, `position: fixed`
- 🐱 Bob / bounce animation
- 🐱 **Draggable** — grab it and move it anywhere
- 🐱 Greeting speech bubble on load
- 🐱 Zero build step — the client bundle is hand-written in the `window.__ModuleLoader__.load` CJS format

## How it works

The plugin declares `dsh.client` in its `package.json`:

```jsonc
{
  "name": "@deepseek-ai/dsh-client-ui-pet",
  "exports": {
    ".":      { "default": "./lib/index.js" },   // node half (loader entry)
    "./client": { "default": "./lib/client.js" } // browser half (the pet)
  },
  "dsh": {
    "client": { "platform": "web" }
  }
}
```

The client half (`lib/client.js`) registers itself with the DSH module system and injects a component into the **`shell.overlay`** slot:

```js
window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-pet",
  factory: (require) => {
    const react = require("react");
    function Pet() { /* fixed bottom-right + drag + bubble */ }
    const inject = ["slots"];
    function apply(ctx) {
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay", id: "pet", order: 10,
      }, Pet));
    }
    return { apply, inject };
  }
});
```

## Install / wire it up

Add a loader row to your DSH **web** profile's user patch layer (`~/.dsh/profiles/web/cordis.patch.yml`), pointing at this package by path (no `node_modules` install needed):

```yaml
- insert:
  - id: ui-pet
    name: 'file:/absolute/path/to/dsh-client-ui-pet/lib/index.js'
```

The web profile uses `patchReload: "live"`, so on a page refresh the pet appears (a `dsh web` restart also works).

## Files

```
.
├── lib/
│   ├── client.js           # browser half — the pet component + styles
│   ├── index.js            # node half — empty apply (loader entry)
│   └── types/*.d.ts        # type stubs
└── package.json            # dsh.client plugin declaration
```

## Configuring the repo

This repo uses the Matt Pocock engineering skills (`/setup-matt-pocock-skills`); see [`AGENTS.md`](./AGENTS.md) and the files in [`docs/agents/`](./docs/agents/).
