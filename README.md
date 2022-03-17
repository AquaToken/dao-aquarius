# AQUA network interfaces
## Description

Description text


## Deployment

### Technology stack
* **[React](https://facebook.github.io/react/)** (17.x)
* **[Webpack](https://webpack.js.org/)** (5.x)
* **[Typescript](https://www.typescriptlang.org/)** (4.x)
* **[Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/)** ([React Hot Loader](https://github.com/gaearon/react-hot-loader))
* Production build script (Webpack)
* Code linting ([ESLint](https://github.com/eslint/eslint)) and formatting ([Prettier](https://github.com/prettier/prettier))
* Test framework ([Jest](https://facebook.github.io/jest/))

### Prerequisites
Make sure you have Node.js between 12 and 13 installed. If not, install it (Node version manager is recommended).

```sh
# Check your node version using this command
node --version
```

### Installation
1. Clone/download repo
2. `yarn install` (or `npm install` for npm)
3. Set environment variable `PROJECT`

```sh
# Voting interface

PROJECT=vote

# Governance interface

PROJECT=governance

# Locker interface

PROJECT=lock

```

### Usage
**Development**

`yarn run start-dev`

* Build app continuously (HMR enabled)
* App served @ `http://localhost:8080`

**Production**

`yarn run start-prod`

* Build app once (HMR disabled) to `/dist/`
* App served @ `http://localhost:3000`

---

**All commands**

Command | Description
--- | ---
`yarn run start-dev` | Build app continuously (HMR enabled) and serve @ `http://localhost:8080`
`yarn run start-prod` | Build app once (HMR disabled) to `/dist/` and serve @ `http://localhost:3000`
`yarn run build` | Build app to `/dist/`
`yarn run test` | Run tests
`yarn run lint` | Run linter
`yarn run lint --fix` | Run linter and fix issues
`yarn run start` | (alias of `yarn run start-dev`)

**Note**: replace `yarn` with `npm` in `package.json` if you use npm.
