# Pixelhue Switcher Companion Module

A Companion module for controlling Pixelhue Switcher devices.  
Provides actions, feedbacks, and presets for seamless integration with your broadcast workflow.

See [HELP.md](./companion/HELP.md), [CHANGELOG](./CHANGELOG) and [LICENSE](./LICENSE)

## Features

- Connect to Pixelhue Switcher devices
- Control screens, layers, presets, swap, freeze, FTB, and more
- Real-time feedbacks for device state
- Customizable actions and dropdowns
- Layer and screen selection with dynamic updates

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/bitfocus/companion-module-pixelhue-switcher.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the module:
   ```bash
   npm run build
   ```
4. Add the module to Companion.

## Usage

- Configure your Pixelhue Switcher device IP in the module settings.
- Use the provided actions to control your device.
- Feedbacks update in real-time based on device state.

## Development

- TypeScript codebase
- Uses [got](https://github.com/sindresorhus/got) for HTTP requests
- See `src/` for main logic
