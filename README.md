<div id="top"></div>


<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/AquaToken/dao-aquarius">
    <img src="https://aqua.network/assets/img/header-logo.svg" alt="Logo" width="250" height="80">
  </a>

<h3 align="center">DAO Aquarius</h3>

  <p align="center">
    Aquarius protocol is governed by DAO voting with AQUA tokens. Vote and participate in discussions to shape the future of Aquarius.
    <br />
    <br />
    <a href="https://github.com/AquaToken/dao-aquarius/issues">Report Bug</a>
    ·
    <a href="https://aqua.network/">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#development-server">Development server</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
Aquarius is designed to supercharge trading on Stellar, bring more liquidity and give control over how it is distributed across various market pairs. It adds incentives for SDEX traders ("market maker rewards") and rewards for AMM liquidity providers. Aquarius allows community to set rewards for selected markets through on-chain voting.

[![Aquarius Screen Shot][product-screenshot]](https://aqua.network/)


#### What is DAO Aquarius?
The end goal is to build a thriving, reliable and decentralized ecosystem around Aquarius and AQUA tokens. Key protocol parameters will be controlled by the AQUA token holders. This will be further explored as the smart contract frameworks on Stellar mature and evolve.

#### How does governance work?
Community users can create proposals to be voted on by the AQUA community. When created, a proposal author will choose an end date for voting on their proposal. The AQUA community has until the end of voting to decide if they would like to vote for or against the proposal.

#### What is Aquarius voting?
Aquarius allows the community of AQUA holders to signal where liquidity is needed through a voting process. This introduces an additional liquidity management layer for the whole Stellar network.

AQUA token holders decide on the market pairs where liquidity is needed most, and also define the size of market maker rewards for each pair.

#### How does voting work?
The voting happens on-chain so the votes can be independently validated by any user. Aquarius provides an interface visualising the votes and current rewards in various markets, as well as a separate dashboard where AQUA holders can vote. Voting works with most Stellar wallets including hardware wallets such as Ledger.

After each round of voting, Aquarius aggregates the individual votes of all Stellar users. Based on the results it defines a list of markets where the incentives should be activated.

#### Where I can find more info about the project?
Check more details and participate in discussions on Discord.
https://discord.gg/sgzFscHp4C

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* **[React](https://facebook.github.io/react/)** (17.x)
* **[Webpack](https://webpack.js.org/)** (5.x)
* **[Typescript](https://www.typescriptlang.org/)** (4.x)
* **[Hot Module Replacement (HMR)](https://webpack.js.org/concepts/hot-module-replacement/)** ([React Hot Loader](https://github.com/gaearon/react-hot-loader))
* Production build script (Webpack)
* Code linting ([ESLint](https://github.com/eslint/eslint)) and formatting ([Prettier](https://github.com/prettier/prettier))
* Test framework ([Jest](https://facebook.github.io/jest/))

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->

## Getting Started

### Prerequisites
Make sure you have Node.js between 12 and 13 installed. If not, install it (Node version manager is recommended).

```sh
# Check your node version using this command
node --version
```

### Installation
1. Clone/download repo
2. `yarn install` (or `npm install` for npm)
3. Set environment variable `WALLET_CONNECT_PROJECT_ID` to work with WalletConnect

```sh
WALLET_CONNECT_PROJECT_ID=...your_key
```

### Usage
**Development**

`yarn run start-dev`

* Build app continuously (HMR enabled)
* Governance served @ `http://localhost:8080`

**Production**

`yarn run start-prod`

* Build app once (HMR disabled) to `/dist/`
* Governance served @ `http://localhost:3000`

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

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Email: [hello@aqua.network](mailto:hello@aqua.network)
Telegram chat: [@aquarius_official_community](https://t.me/aquarius_official_community)
Telegram news: [@aqua_token](https://t.me/aqua_token)
Twitter: [@aqua_token](https://twitter.com/aqua_token)
GitHub: [@AquaToken](https://github.com/AquaToken)
Discord: [@Aquarius](https://discord.gg/sgzFscHp4C)
Reddit: [@AquariusAqua](https://www.reddit.com/r/AquariusAqua/)
Medium: [@aquarius-aqua](https://medium.com/aquarius-aqua)

Project Link: [https://github.com/AquaToken/dao-aquarius](https://github.com/AquaToken/dao-aquarius)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/AquaToken/dao-aquarius.svg?style=for-the-badge
[contributors-url]: https://github.com/AquaToken/dao-aquarius/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/AquaToken/dao-aquarius.svg?style=for-the-badge
[forks-url]: https://github.com/AquaToken/dao-aquarius/network/members
[stars-shield]: https://img.shields.io/github/stars/AquaToken/dao-aquarius.svg?style=for-the-badge
[stars-url]: https://github.com/AquaToken/dao-aquarius/stargazers
[issues-shield]: https://img.shields.io/github/issues/AquaToken/dao-aquarius.svg?style=for-the-badge
[issues-url]: https://github.com/AquaToken/dao-aquarius/issues
[license-shield]: https://img.shields.io/github/license/AquaToken/dao-aquarius.svg?style=for-the-badge
[license-url]: https://github.com/AquaToken/dao-aquarius/blob/master/LICENSE
[product-screenshot]: images/screenshot.png
