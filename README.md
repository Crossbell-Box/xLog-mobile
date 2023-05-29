# xLog-mobile  

<p align="center">
  WIP 🟡
</p>

> Mobile app for the first on-chain and open-source blogging platform for everyone. 

[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg?logo=discord&style=flat-square)](https://discord.gg/46VJMMVCuF) &nbsp;[![Twitter](https://img.shields.io/badge/Twitter-@_xLog-1d9bf0.svg?logo=twitter&style=flat-square)](https://twitter.com/_xLog) &nbsp;[![build](https://img.shields.io/github/actions/workflow/status/Crossbell-Box/xLog/docker-build-push-prod.yml?logo=github&style=flat-square)](https://github.com/Crossbell-Box/xLog/actions/workflows/docker-build-push.yml)


## Development
### Prerequisites

- We recommend installing [ni](https://github.com/antfu/ni) to help switching between repos using different package managers.

    ```sh
    npm install @antfu/ni --global
    ```


- Duplicate `.env.example` and rename it to `.env.common`.  

    ```sh
    cp .env.example .env.common
    ```

    Fill in the environment variables if you have.

    ```
    APP_SCHEME=
    WALLET_PROJECT_ID=
    EXPO_PROJECT_ID=
    OWNER=
    UPDATES_URL=
    INFURA_ID=
    ```

    Generate types for environment variables.

    ```sh
    nr generate-env-types
    ```

- If you want to specify the environment variables for the various environments, you can create `.env.development`, `.env.staging` and `.env.production` files. (not required and supported yet)


### Usage

- Fork this repository and clone it to your local machine.

    ```sh
    git clone https://github.com/Crossbell-Box/xLog-mobile.git
    ```

- Install dependencies

    ```sh
    ni
    ```

- Prebuild the project

    ```sh
    nr prebuild
    ```

- Start the app

    ```sh
    nr ios/android # If you want to run on your real device, you need to add `-d` flag.
    ```

### Publishing
Refer to this [document](https://docs.expo.dev/build/setup/) and check scripts in the [packages.json](./packages.json) file.

### Continuous Integration
Refer to this [document](https://docs.expo.dev/eas-update/how-eas-update-works/) and check CI configuration files in the [.github/workflows](./.github/workflows) directory.

## Contributing
[More details](./CONTRIBUTING.md)

