# xLog-mobile  

<p align="center">
  WIP 🟡
</p>

> Mobile app for the first on-chain and open-source blogging platform for everyone. 

[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg?logo=discord&style=flat-square)](https://discord.gg/46VJMMVCuF) &nbsp;[![Twitter](https://img.shields.io/badge/Twitter-@_xLog-1d9bf0.svg?logo=twitter&style=flat-square)](https://twitter.com/_xLog) &nbsp;[![build](https://img.shields.io/github/actions/workflow/status/Crossbell-Box/xLog/docker-build-push-prod.yml?logo=github&style=flat-square)](https://github.com/Crossbell-Box/xLog/actions/workflows/docker-build-push.yml)

## Roadmap

- [x] README for developers
- [ ] ❔

## Development
### Prerequisites

- [pnpm](https://pnpm.io/) `7.0+` is required to install dependencies.  

    ```sh
    npm install pnpm -g
    ```

    ***Do not use the latest version of pnpm, because there are some breaking changes between EAS an local.** 

- Duplicate `.env.example` and rename it to `.env.common`.  

    ```sh
    cp .env.example .env.common
    ```

    Fill in the environment variables if you have.

    ```
    EXPO_PROJECT_ID=""
    BUNDLE_IDENTIFIER=""
    OWNER=""
    UPDATES_URL=""
    ```

    Generate types for environment variables.

    ```sh
    nr generate-env-types
    ```

- If you want to specify the environment variables for the various environments, you can create `.env.development`, `.env.staging` and `.env.production` files. ( not required and supported yet )


### Usage

- Fork this repository and clone it to your local machine.

    ```sh
    git clone https://github.com/Crossbell-Box/xLog-mobile.git
    ```

- Install dependencies

    ```sh
    pnpm install
    ```

- Start the app

    ```sh
    pnpm start
    ```

### Publishing
Refer to this [document](https://docs.expo.dev/build/setup/) and check scripts in the [packages.json](./packages.json) file.

### Continuous Integration
Refer to this [document](https://docs.expo.dev/eas-update/how-eas-update-works/) and check CI configuration files in the [.github/workflows](./.github/workflows) directory.

## Contributing

- Fork
- PR to `develop` branch

We will test new features on staging branch and release it. 🚀