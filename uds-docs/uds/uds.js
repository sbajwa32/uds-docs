/* UDS Web Components compatibility loader.
   Prefer importing @uds/web-components and calling registerUdsComponents(). */
(function () {
  var current = document.currentScript && document.currentScript.src;
  var src = current ? new URL('../web-components.js', current).href : './web-components.js';
  var script = document.createElement('script');
  script.type = 'module';
  script.src = src;
  document.head.appendChild(script);
})();
