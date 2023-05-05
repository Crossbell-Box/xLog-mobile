# xlog

## 0.2.0

### Minor Changes

- aa7b055: - Added more themes.
  - Supported dark/light mode.
  - Displayed user info in the drawer menu.
  - Made some UX improvements.
  - Fixed some bugs.
- 67730af: - Connect to the wallet and sign in.
  - Integrate the @crossbell tolls.
  - Support to the ConnectWallet V2 in advance.
- 3432478: support to set hot interval.
- 67730af: Support to sign in.

### Patch Changes

- 89ba825: Fixed the status bar style error
- 3fa0ed5: 🐛 Resolved the query issue in the hot tab.

## 0.1.0

### Minor Changes

- cc1daa3: ## Features

  - Feed page

    - Post details page
    - Navigation
    - i18n
    - CI/EAS

  - Develop the web3 API integration for fetching blog data
    - Set up the @crossbell/indexer for fetching data from the blockchain
    - Implement the API call for fetching the list of blog posts
    - Implement the API call for fetching the details of a specific blog post
  - Integrate data fetching with the feed list and post detail views

    - Display the fetched blog posts in the feed list view
    - Display the fetched post details in the post detail view

  - Configured @Walletconnect v1, currently able to complete wallet connections (temporarily does not support sign in).
  - Support @Walletconnect v2 (expected to switch in June).

  ## Infra

  - Unit test
  - 🚀 Display the user information in the feed list.
  - Configured support for iOS/Android dev-client and Expo EAS builds.

  ## Bug Fixes

  - Some development workflow optimizations.
  - Some code optimizations.
  - Resolved some bugs and adjusted some style issues.

## 0.1.0

### Minor Changes

- 3280d18: - Feed page
  - Post details page
  - Navigation
  - i18n
  - CI/EAS
- 17ee6cb: ## Features

  - Develop the web3 API integration for fetching blog data
    - Set up the @crossbell/indexer for fetching data from the blockchain
    - Implement the API call for fetching the list of blog posts
    - Implement the API call for fetching the details of a specific blog post
  - Integrate data fetching with the feed list and post detail views
    - Display the fetched blog posts in the feed list view
    - Display the fetched post details in the post detail view

  ## Infra

  - Unit test

- 413fc75: 🚀 Display the user information in the feed list.
- 4c23c10: - Configured @Walletconnect v1, currently able to complete wallet connections (temporarily does not support sign in).
  - Support @Walletconnect v2 (expected to switch in June).
  - Configured support for iOS/Android dev-client and Expo EAS builds.
  - Some development workflow optimizations.
  - Some code optimizations.
  - Resolved some bugs and adjusted some style issues.
