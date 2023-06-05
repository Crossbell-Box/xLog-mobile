# xlog

## 0.9.0

### Minor Changes

- 51124d5: Bump version.

### Patch Changes

- 892d44a: Display version correctly.
- 1040038: Ignoring the patch version.

## 0.8.1

### Patch Changes

- 74f9cff: Made some modifications to the copy.
- 007f0fe: Added Login page.
- f4dba26: Added Following tabs list.

## 0.8.0

### Minor Changes

- 2249bf4: Bump minor version.

## 0.7.0

### Minor Changes

- bac3901: Following the system color scheme correctly.
- 668c310: Support providing feedback on article issues.

### Patch Changes

- 8047ef1: Open the post details page via universal links.
- 677e318: Solved the universal link issue.
- 87a1f70: Opening Drawer conveniently.
- 6f1231a: Display the date time of feed items correctly.
- 2632cf0: solved the crash problem when close the connecting modal.
- 40f10fc: Configure Sentry.

## 0.6.6

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.5

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.4

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.3

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.2

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.1

### Patch Changes

- 677e318: Solved the universal link issue.

## 0.6.0

### Minor Changes

- 0584747: Support to comment.
- 15ee396: support to universal links.

## 0.5.0

### Minor Changes

- 1e061e0: - 更好用的文章详情页
  - 支持保存图片到相册
  - 签名授权后每次交互不再需要签名
  - 提醒进行签名设置
  - 优化了一些用户体验
  - 解决了一些 Bug

### Patch Changes

- c7464b4: Performed minor code style tweaks.
- 747b885: Solved the crash issue on Android.
- e05e10b: 🚀 support to display post content only.
- 2471d51: - UI issues fixed.
  - Open drawer via avatar button.
  - Support to follow the system color scheme.
- 38cb225: Replace the webview url.
- a4df6c1: Resolved the crash issue on the notification page..
- a3589da: summary the image on feedlist
- 0e6a217: enable content loader animation on Android.
- fa5f025: UX improvements.
- 9299d45: support to browse comments.

## 0.4.0

### Minor Changes

- e51fbd5: 🚀 Complete the basic dashboard information display.

### Patch Changes

- eaa2b3f: fix: Resolve the issue of the animation stuttering.
- e6d20a3: - Change i18n-js to i18next.
  - Hide the profile pages header.
  - Fallback to key when the target i18n value is null
  - Completed the pages, posts, comments pages.
  - Modify the CI.
- b85acff: fix: close the drawer after disconnect.

## 0.3.0

### Minor Changes

- e82a4a1: support to set hot interval.

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
