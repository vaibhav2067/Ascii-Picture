# Contributing to Ascii Picture

First off, thank you for considering contributing to Ascii Picture!

## Workflow

1. **Fork & Clone**: Fork the project on GitHub and clone your fork locally.
2. **Branch**: Create a feature branch (`git checkout -b feature/your-feature`).
3. **Commit**: Make your changes. Ensure you format the code (`npm run format`).
4. **Push**: Push your changes to your fork.
5. **Pull Request**: Open a Pull Request from your fork to the main repository.

## Architecture

The project has been migrated to use modern frontend tooling:

- **`src/plugin/code.ts`**: Contains the Figma sandbox logic. This has access to the Figma Document API.
- **`src/ui/`**: Contains the plugin's UI logic. It is loaded in an iframe.
  - `components/`: UI logic broken down into modules.
  - `styles/`: CSS styles for the UI.
  - `index.html`: The UI entry point.
- **Vite & esbuild**: Vite is used to bundle the UI, inlining everything into a single HTML file (as required by Figma). Esbuild bundles the plugin logic.

## Formatting & Linting

We use Prettier for code formatting. Please ensure you run `npm run format` before pushing your changes to avoid style-related PR comments. We also use ESLint to catch common errors.

If you have any questions, feel free to open an issue!
