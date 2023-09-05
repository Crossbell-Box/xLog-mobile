const lazyLoadImages = `
var imagesToBlock = [];

window.addEventListener("load", function() {
  var restoreImages = function() {
    for (var i = 0; i < imagesToBlock.length; i++) {
      imagesToBlock[i].src = imagesToBlock[i].getAttribute("data-src");
    }
    imagesToBlock = [];
  };

  var blockImages = function() {
    var images = document.getElementsByTagName("img");
    for (var i = 0; i < images.length; i++) {
      imagesToBlock.push(images[i]);
      images[i].setAttribute("data-src", images[i].src);
      images[i].src = "";
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    restoreImages();
  });

  blockImages();
});
`;

export const javaScriptContentLoaded = (
  mode: string,
  bottomBarHeight: number,
  height: number,
) => `
    ${lazyLoadImages}
    
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.getElementsByTagName('head')[0].appendChild(meta);

    const nativeWindowOpen = window.open;
    window.open = function(url, target, features, replace) {
      console.log('Intercepted window.open call with url:', url);
      return null;
    };

    // function updateColorMode() {
    //   window.localStorage.setItem('darkMode', '${mode}');
    // }

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
          link: event.target.href,
          title: event.target.innerText
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

    // updateColorMode();
  `;
