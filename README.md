# companion-module-pixelhue-fseries

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

This module will allow you to control the following Pixelhue products: F8, F4, F4 Lite.

## File Structure

```
.
├── companion
│   ├── HELP.md                'Help' document for user, used within Companion.
│   └── manifest.json          Provides information to Companion about this module.
├── doc
│   └── ControlProtocol.md     Device Control Protocol
├── LICENSE
├── package.json               Standard node.js file
├── README.md
└── src                      - Module Source Code
    ├── actions.js             the "commands" being executed button pushed.
    ├── main.js                The main execution script for this module
    └── presets.js             Description of ready-made buttons

```

## Changelog

### V1.0.0

First version built for Companion 3.0
