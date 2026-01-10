# Fight the Future Game

A React-based game application built with Create React App. 

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm, yarn, or pnpm

### Installation

Install dependencies: 

```bash
npm install
```

Or if you're using pnpm:

```bash
pnpm install
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder. 

It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

## Development in VS Code

The project includes VS Code configurations for an enhanced development experience:

- **Install dependencies**: Run `npm install` in the workspace root (or use the Task `Install Dependencies`).
- **Start dev server**:  Use the VS Code Task `Start Dev Server` (or run `npm start`). The app is served at http://localhost:3000 by default.
- **Debug in browser**:  Open the Debug view and run the configuration **Launch Chrome (http://localhost:3000)** — it will run the dev server first, then open Chrome and attach the debugger.

### VS Code Workspace Files

- `.vscode/tasks.json` — Task runner for install/start/build
- `.vscode/launch.json` — Browser launch/attach debug configurations
- `.vscode/extensions.json` — Recommended extensions (ESLint, Prettier, Chrome debugger)
- `.vscode/settings.json` — Basic workspace settings

If you use a different package manager (yarn or pnpm), adjust the Tasks accordingly.

## Deployment

This project is configured for deployment to Vercel. See the `.env.production` file for production environment configuration.

## Built With

- [React](https://reactjs.org/) 18.2.0
- [Create React App](https://github.com/facebook/create-react-app)
- [React Scripts](https://www.npmjs.com/package/react-scripts) 5.0.1

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
