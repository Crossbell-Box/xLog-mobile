# xLog-mobile  

<p align="center">
  WIP 🟡
</p>

> Mobile app for the first on-chain and open-source blogging platform for everyone. 

[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg?logo=discord&style=flat-square)](https://discord.gg/46VJMMVCuF) &nbsp;[![Twitter](https://img.shields.io/badge/Twitter-@_xLog-1d9bf0.svg?logo=twitter&style=flat-square)](https://twitter.com/_xLog) &nbsp;[![build](https://img.shields.io/github/actions/workflow/status/Crossbell-Box/xLog/docker-build-push-prod.yml?logo=github&style=flat-square)](https://github.com/Crossbell-Box/xLog/actions/workflows/docker-build-push.yml)


<!-- ## Roadmap

- For contributors


- Project Setup and Infrastructure
    - [x] CI/CD
    - [x] EAS
    - [ ] Sentry
    - [ ] Testing (unit, e2e, snapshot, etc.)

- READ-ONLY
    - [x] README for developers
    - [ ] Feed list
    - [ ] Post details -->

## Roadmap

### 1. Project Setup and Infrastructure

- [x] Set up the development environment and project structure
- [x] Set up version control 
- [x] Configure Continuous Integration and Continuous Deployment (CI/CD)
- [x] Set up EAS (Expo Application Services) 
- [x] Create a README for developers, including setup instructions, project overview, and contribution guidelines
- [ ] Set up error monitoring and reporting (Sentry)
- [ ] Implement testing (unit tests, end-to-end tests, snapshot tests, etc.)

### 2. Core Features - Read-Only[(Milestone)](https://github.com/Crossbell-Box/xLog-mobile/milestone/1)
#### 2.1. Views Implementation

- [x] Add navigation between the feed list and post detail views
- [x] Implement the main feed list view
- [ ] Implement the post detail view
    - Use the webview to render the post content. [(issue)](https://github.com/Crossbell-Box/xLog-mobile/issues/12)

#### 2.2. Data Fetching

- [ ] Develop the web3 API integration for fetching blog data
    - [ ] Set up the @crossbell/indexer for fetching data from the blockchain
    - [ ] Implement the API call for fetching the list of blog posts
    - [ ] Implement the API call for fetching the details of a specific blog post
- [ ] Integrate data fetching with the feed list and post detail views
    - [ ] Display the fetched blog posts in the feed list view
    - [ ] Display the fetched post details in the post detail view

### 3. User Interface and User Experience

- [ ] Design and implement a clean and modern user interface for the feed list and post detail views
- [ ] Ensure the application is responsive and works well on various devices and screen sizes
- [ ] Implement smooth transitions and animations for enhanced user experience
- [ ] Ensure accessibility features are considered and implemented where applicable

### 4. Performance and Optimization

- [ ] Optimize data fetching and caching for improved performance
- [ ] Implement lazy loading and pagination for the feed list view to handle large amounts of data
- [ ] Optimize the webview for improved performance and reduced time to first paint. [(issue)](https://github.com/Crossbell-Box/xLog-mobile/issues/12)

### 5. Documentation and Tutorials

- [ ] Create comprehensive user documentation, including usage instructions and troubleshooting tips
- [ ] Create a demo video or animated GIF showcasing the application's features and functionality

### 6. Community Engagement and Support

- [ ] Set up community channels for discussion and support (Discord)


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

- If you want to specify the environment variables for the various environments, you can create `.env.development`, `.env.staging` and `.env.production` files. (not required and supported yet)


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