# Create React App

This directory is a brief example of a [Create React App](https://github.com/facebook/create-react-app) site that can be deployed to Vercel with zero configuration.

## Deploy Your Own

Deploy your own Create React App project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/create-react-app&template=create-react-app)

_Live Example: https://create-react-template.vercel.app/_

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

## Run in VS Code

- **Install dependencies**: run `npm install` in the workspace root (or use the Task `Install Dependencies`).
- **Start dev server**: use the VS Code Task `Start Dev Server` (or run `npm start`). The app is served at http://localhost:3000 by default.
- **Debug in browser**: open the Debug view and run the configuration **Launch Chrome (http://localhost:3000)** — it will run the dev server first, then open Chrome and attach the debugger.

Files added in the workspace:
- `.vscode/tasks.json` — task runner for install/start/build.
- `.vscode/launch.json` — browser launch/attach debug configurations.
- `.vscode/extensions.json` — recommended extensions (ESLint, Prettier, Chrome debugger).
- `.vscode/settings.json` — basic workspace settings.

If you use a different package manager, adjust the Tasks accordingly.