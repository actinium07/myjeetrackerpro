/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "3e8f719db65e9d03e9d4fb344afefbb5"
  }, {
    "url": "pwa-512x512.png",
    "revision": "154704fae9d8164fa2eefe44e48de357"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9dec94ea022ce997119900639f46015a"
  }, {
    "url": "index.html",
    "revision": "644a70301f4ea0cb4d365ad76f92ec25"
  }, {
    "url": "icon.svg",
    "revision": "0f4740f9367cf77c33ca7dc6c3351014"
  }, {
    "url": "favicon.ico",
    "revision": "b180ae208ed70584d52ebfed21a7232b"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "637b99997510f8470843a96a8dd22693"
  }, {
    "url": "assets/index-CEO61bsV.js",
    "revision": null
  }, {
    "url": "assets/index-C2SEcP05.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "637b99997510f8470843a96a8dd22693"
  }, {
    "url": "favicon.ico",
    "revision": "b180ae208ed70584d52ebfed21a7232b"
  }, {
    "url": "icon.svg",
    "revision": "0f4740f9367cf77c33ca7dc6c3351014"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9dec94ea022ce997119900639f46015a"
  }, {
    "url": "pwa-512x512.png",
    "revision": "154704fae9d8164fa2eefe44e48de357"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "3e8f719db65e9d03e9d4fb344afefbb5"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e62503702f9f1b06913e64bb8f85fbaa"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
