export const javascriptContent = (
  bottomBarHeight: number,
  height: number,
) => `
    function handleImageClick(event) {
      const allImageUrls = Array.from(document.getElementsByTagName('img')).map(img => img.src);
      const clickedImageUrl = event.target.src;
      const imageUrlSet = new Set([clickedImageUrl, ...allImageUrls]);
      const imageUrlArray = Array.from(imageUrlSet);

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          imageUrlArray
        })
      );
    }

    function sendHeight() {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          height: Math.max(document.body.scrollHeight + ${bottomBarHeight}, ${height})
        })
      );
    }
    
    window.addEventListener("load", function() {
      setTimeout(sendHeight, 1000); // TODO: find a better way to do this 🔴 

      const images = document.getElementsByTagName('img');
      for (let i = 0; i < images.length; i++) {
        images[i].addEventListener('click', handleImageClick);
      }

      const links = document.getElementsByTagName('a');
      for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function(event) {
          event.preventDefault();
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              link: event.target.href
            })
          );
        });
      }

      const mainEle = document.querySelector("body > div.xlog-page.xlog-page-post.xlog-user.xlog-deprecated-class > main")
      if(mainEle){
        mainEle.style.paddingTop = "0px";
      }
    });

    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      attributes: true, 
      childList: true, 
      subtree: true 
    });
  `;
