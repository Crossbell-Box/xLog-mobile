export const javaScriptContentLoaded = (
  bottomBarHeight: number,
  height: number,
) => `
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);

    const nativeWindowOpen = window.open;
    window.open = function(url, target, features, replace) {
      console.log('Intercepted window.open call with url:', url);
      return null;
    };

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
      event.stopPropagation();

      const isAvatar = img => img.width === 32 && img.height === 32;

      if (isAvatar(event.target)) {
        return false;
      }

      const isDataUrl = src => src.startsWith('data:image');
      const clickedImageUrl = event.target.src || event.target.dataset.src;

      if (isDataUrl(clickedImageUrl)) {
        return false;
      }

      const images = Array.from(document.getElementsByTagName('img')).filter(img => !isAvatar(img) && !isDataUrl(img.src));
      const allImageUrls = Array.from(images).map(img => img.src || img.dataset.src);
      const imageUrlSet = new Set([clickedImageUrl, ...allImageUrls]);
      const imageUrlArray = Array.from(imageUrlSet);

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          imageUrlArray,
        })
      );

      return false;
    }

    function handleLinkClick(event) {
      event.preventDefault();
      
      let target = event.target.closest('a');
      if (target) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            link: target.href,
            title: target.innerText
          })
        );
      }

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
          links[i].addEventListener('click', handleLinkClick);
          observedLinks.add(links[i]);
        }
      }

      const mainEle = document.querySelector("body > div.xlog-page.xlog-page-post.xlog-user.xlog-deprecated-class > main")
      if(mainEle){
        mainEle.style.marginTop = "-20px";
        mainEle.style.paddingBottom = "80px";
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
  `;
