# hunter-gatherer boilerplate

A Typescript and WebGL boilerplate. As barebones I'm willing to go.

Featuring: 

- Live reload
- Typescript, GLSL and SASS support
- Few dependencies and fast build times thanks to `esbuild`

## How to develop :

```
npm i && npm run dev
```

By default, this will serve `public/index.html` using bundled `public/built/app.js` and `public/built/scss/` from `/src/app.ts` on `localhost:1234`. Assets need to be fetched from the `public` folder.

These values are configurable in `watch.mjs` and through the <script/> tag in `index.html`.

## How to deploy
```
npm run build
```

This minifies files and shaders. You can then deploy the `public` folder.

Settings are available in `build.mjs`