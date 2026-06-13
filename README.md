# Ascii Picture

A Figma plugin that converts images into ASCII art natively inside Figma.

## Getting Started

To run this plugin locally and make contributions:

### Prerequisites

- Node.js (v18 or newer recommended)
- Figma Desktop App

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vaibhav2067/Ascii-Picture.git
   cd Ascii-Picture
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

We use Vite to bundle the UI code and esbuild to bundle the plugin sandbox code.

1. Run the build script:

   ```bash
   npm run build
   ```

   _This will compile the `src/` folder into the `dist/` directory._

2. Load into Figma:
   - Open Figma desktop app
   - Go to `Plugins > Development > Import plugin from manifest...`
   - Select the `manifest.json` file in the root of this project.

### Formatting

We use Prettier to enforce consistent code style. Run formatting before committing:

```bash
npm run format
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting Pull Requests.
