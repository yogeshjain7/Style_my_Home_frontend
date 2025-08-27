const CACHE_NAME = "furniture-ar-cache-v1";
const ASSETS = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",

  // Icons
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",

  // Product images
  "assets/images/Arm_Chair.png",
  "assets/images/Brown_L-Sofa.png",
  "assets/images/Chair.png",
  "assets/images/Master_Bed.png",
  "assets/images/Metal_Shelf.png",
  "assets/images/Night_Stand.png",
  "assets/images/Shelf.png",
  "assets/images/Study_Table.png",
  "assets/images/Table.png",
  "assets/images/Wash_Basin.png",
  "assets/images/wood_table.png",

  // 3D models
  "assets/models/Arm_Chair.glb",
  "assets/models/Brown_L-Sofa.glb",
  "assets/models/Chair.glb",
  "assets/models/Master_Bed.glb",
  "assets/models/Metal_Shelf.glb",
  "assets/models/Night_Stand.glb",
  "assets/models/Shelf.glb",
  "assets/models/Study_Table.glb",
  "assets/models/Table.glb",
  "assets/models/Wash_Basin.glb",
  "assets/models/wood_table.glb"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching assets for offline use");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event (clean old caches)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});