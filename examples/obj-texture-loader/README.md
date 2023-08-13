# hunter-gatherer boilerplate

A Typescript and WebGL boilerplate. As barebones I'm willing to go.

## How to develop :

```
npm i && npm run dev
```

By default, this will serve `public/index.html` using bundled `public/built/app.js` and `public/built/scss/` from `/src/app.ts` on `localhost:1234`. Assets need to be fetched from the `public` folder.

These values are configurable in `watch.mjs` and through the <script/> tag in `index.html`.