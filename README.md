# xLog-mobile  

> Mobile app for the first on-chain and open-source blogging platform for everyone. 

[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg?logo=discord&style=flat-square)](https://discord.gg/46VJMMVCuF) &nbsp;[![Twitter](https://img.shields.io/badge/Twitter-@_xLog-1d9bf0.svg?logo=twitter&style=flat-square)](https://twitter.com/_xLog) &nbsp;[![build](https://img.shields.io/github/actions/workflow/status/Crossbell-Box/xLog/docker-build-push-prod.yml?logo=github&style=flat-square)](https://github.com/Crossbell-Box/xLog/actions/workflows/docker-build-push.yml) &nbsp;[![iOS Download](https://img.shields.io/badge/iOS-Download-000000?style=flat-square&logo=apple)](https://apps.apple.com/cn/app/xlog-on-chain-blogging/id6449499296) &nbsp;[![Android Download](https://img.shields.io/badge/Android-Download-3DDC84?style=flat-square&logo=android)](https://play.google.com/store/apps/details?id=com.crossbell.xlog)

<p align="center">
    <img src="./assets/download-qrcode.png" width="20%" />
</p>


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

    Generate types for environment variables.

    ```sh
    nr generate-env-types
    ```

- Create `.env.development`, `.env.staging` and `.env.production` files and fill the `APP_HOST` variable for various environments.  
    ```
    APP_HOST=xlog.app
    ```


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
    nr prebuild:dev
    ```

- Start the app
    
    ```sh
    # If you want to run on your real device, you need to add `-d` flag.
    nr ios 
    nr android
    ```

### Publishing
Refer to this [document](https://docs.expo.dev/build/setup/) and check scripts in the [package.json](./package.json) file.

### Continuous Integration
Refer to this [document](https://docs.expo.dev/eas-update/how-eas-update-works/) and check CI configuration files in the [.github/workflows](./.github/workflows) directory.

## Contributing
[More details](./CONTRIBUTING.md)

