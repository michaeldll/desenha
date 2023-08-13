(() => {
  // src/scss/global.scss
  var css = `@font-face {
  font-family: "Open Sans";
  src: url("assets/fonts/opensans/OpenSans-Regular.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}
body {
  margin: 0;
  overflow: hidden;
}

.canvas-gl {
  width: 100%;
  height: 100vh;
}`;
  document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css));
})();
