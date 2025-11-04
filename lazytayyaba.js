// === Lazy Load with Alt + Title Support ===
function ArlinaCodes() {
  var imgs = document.getElementsByClassName("lazy");
  for (var i = 0; i < imgs.length; i++) {
    if (isInViewport(imgs[i])) {
      // Set src from data-src
      var src = imgs[i].getAttribute("data-src");
      if (src && imgs[i].src !== src) {
        imgs[i].src = src;
      }

      // Copy alt from data-alt if missing
      var dataAlt = imgs[i].getAttribute("data-alt");
      if (dataAlt && (!imgs[i].alt || imgs[i].alt === "")) {
        imgs[i].alt = dataAlt;
      }

      // Copy title from data-alt or data-title if missing
      var dataTitle = imgs[i].getAttribute("data-title") || dataAlt;
      if (dataTitle && (!imgs[i].title || imgs[i].title === "")) {
        imgs[i].title = dataTitle;
      }

      // Optional: add loaded class
      imgs[i].classList.add("loaded");
    }
  }
}

function isInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function registerListener(event, func) {
  if (window.addEventListener) {
    window.addEventListener(event, func);
  } else {
    window.attachEvent("on" + event, func);
  }
}

registerListener("load", ArlinaCodes);
registerListener("scroll", ArlinaCodes);

// Smooth scroll code (original from Arlina)
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var links = document.querySelectorAll("a"),
    len = links.length,
    body = /firefox|trident/i.test(navigator.userAgent)
      ? document.documentElement
      : document.body,
    easeInOutCubic = function (t, b, c, d) {
      return (t /= d / 2) < 1
        ? (c / 2) * t * t * t + b
        : (c / 2) * ((t -= 2) * t * t + 2) + b;
    };

  while (len--) {
    links[len].addEventListener("click", function (e) {
      var id = /[^#]+$/.exec(this.href);
      if (!id) return;
      var target = document.getElementById(id[0]);
      if (!target) return;
      var start = body.scrollTop,
        end = target.getBoundingClientRect().top,
        maxScroll = body.scrollHeight - window.innerHeight,
        distance = maxScroll > start + end ? end : maxScroll - start,
        duration = 900,
        startTime;

      function scrollStep(time) {
        startTime = startTime || time;
        var elapsed = time - startTime,
          nextScroll = easeInOutCubic(elapsed, start, distance, duration);
        body.scrollTop = nextScroll;
        if (elapsed < duration) requestAnimationFrame(scrollStep);
      }

      requestAnimationFrame(scrollStep);
      e.preventDefault();
    });
  }
});