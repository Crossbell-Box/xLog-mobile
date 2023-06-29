export const javaScriptBeforeContentLoaded = (
  isDarkMode: boolean,
  mode: string,
  bottomBarHeight: number,
  height: number,
) => `
    const nativeWindowOpen = window.open;
    window.open = function(url, target, features, replace) {
      console.log('Intercepted window.open call with url:', url);
      return null;
    };

    function updateColorMode() {
      const xlogConfigurationKey = 'xlog';
      const originalXLogStorageData = JSON.parse(localStorage.getItem(xlogConfigurationKey)||"{}");
      originalXLogStorageData['darkMode'] = JSON.stringify(${isDarkMode});
      localStorage.setItem(xlogConfigurationKey, JSON.stringify(originalXLogStorageData));
      document.cookie = "color_scheme=${mode};";
    }

    function debounce(func, wait) {
      let timeout;
      return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, wait);
      }
    }

    const sendHeight = debounce(() => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          height: Math.max(document.body.scrollHeight + ${bottomBarHeight}, ${height})
        })
      );
    }, 300);

    function handleImageClick(event) {
      event.preventDefault();
      const clickedImageUrl = event.target.src;
      const images = document.getElementsByTagName('img');
      const allImageUrls = Array.from(images).map(img => img.src);
      const imageUrlSet = new Set([clickedImageUrl, ...allImageUrls]);
      const imageUrlArray = Array.from(imageUrlSet);

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          imageUrlArray
        })
      );

      return false;
    }

    function handleLinkClick(event) {
      event.preventDefault();
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          link: event.target.href
        })
      );
      return false;
    }

    const observedImages = new Set();
    const observedLinks = new Set();

    const observer = new MutationObserver(() => {
      const images = document.getElementsByTagName('img');
      const links = document.getElementsByTagName('a');

      for (let i = 0; i < images.length; i++) {
        if (!observedImages.has(images[i])) {
          images[i].addEventListener('click', handleImageClick);
          observedImages.add(images[i]);
        }
      }

      for (let i = 0; i < links.length; i++) {
        if (!observedLinks.has(links[i])) {
          links[i].addEventListener('click', handleLinkClick, true);
          observedLinks.add(links[i]);
        }
      }

      const mainEle = document.querySelector("body > div.xlog-page.xlog-page-post.xlog-user.xlog-deprecated-class > main")
      if(mainEle){
        mainEle.style.paddingTop = "0px";
        mainEle.style.paddingLeft = "8px";
        mainEle.style.paddingRight = "8px";
      }

      sendHeight();
    });

    observer.observe(document.body, {
      attributes: true, 
      childList: true, 
      subtree: true 
    });

    updateColorMode();
  `;
