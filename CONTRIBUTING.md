# Contributing


## Development

### Prerequisites

- Fork this repository and clone it to your local machine.

    ```sh
    git clone https://github.com/Crossbell-Box/xLog-mobile.git
    ```
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

- Create `.env.development`, `.env.test` and `.env.production` files and fill the `APP_HOST` variable for various environments.  
    ```
    APP_HOST=xlog.app
    ```
### Run the app

- Install dependencies

    ```sh
    ni
    ```

- Prebuild the project

    ```sh
    nr prebuild:development
    ```

- Start the app
    
    ```sh
    # If you want to run on your real device, you need to add `-d` flag.
    nr ios 
    nr android
    ```

## Creating Pull Requests
> `xLog-preview` will be released with preview version when PR merged to `main` branch and `xLog` will be submit to App Store when we think it's ready.

- Create a new changeset via `npx changeset`.
- PR to `develop` branch.

## Changeset

- Major (DO NOT BUMP)
- Minor (Native code changes)
- Patch (JS code changes)
