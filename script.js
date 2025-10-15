document.addEventListener('DOMContentLoaded', () => {
  const backendUrl = 'http://localhost:5000'; // URL for your backend server
  let isLoggedIn = false;
  let pendingAction = null; // Stores the action to perform after login { action: 'view' | 'snapshot', card: element }

  // --- ALL PRODUCT DATA IS NOW STORED HERE ON THE FRONTEND ---
  const furnitureData = [
    { id: "arm-chair", category: "chair", name: "Arm Chair", dimensions: "H: 95cm W: 80cm D: 75cm", imagePath: "assets/images/Arm_Chair.png", modelPath: "assets/models/Arm_Chair.glb" },
    { id: "l-sofa", category: "sofa", name: "Brown L-Sofa", dimensions: "H: 85cm W: 240cm D: 160cm", imagePath: "assets/images/Brown_L-Sofa.png", modelPath: "assets/models/Brown_L-Sofa.glb" },
    { id: "wash-basin", category: "basin", name: "Wash Basin", dimensions: "H: 88cm W: 60cm D: 45cm", imagePath: "assets/images/Wash_Basin.png", modelPath: "assets/models/Wash_Basin.glb" },
    { id: "bed", category: "bed", name: "Bed", dimensions: "H: 110cm W: 180cm D: 210cm", imagePath: "assets/images/bed.png", modelPath: "assets/models/bed.glb" },
    { id: "table-lamp", category: "lighting", name: "Table Lamp", dimensions: "H: 55cm W: 30cm D: 30cm", imagePath: "assets/images/table_lamp.png", modelPath: "assets/models/table_lamp.glb" },
    { id: "tv-stand", category: "storage", name: "TV Stand", dimensions: "H: 50cm W: 180cm D: 40cm", imagePath: "assets/images/tv_stand.png", modelPath: "assets/models/tv_stand.glb" },
    { id: "antique-desk", category: "table", name: "Antique Desk", dimensions: "H: 78cm W: 120cm D: 60cm", imagePath: "assets/images/antique_desk.png", modelPath: "assets/models/antique_desk.glb" },
    { id: "bookshelf", category: "storage", name: "Bookshelf", dimensions: "H: 180cm W: 90cm D: 30cm", imagePath: "assets/images/bookshelf.png", modelPath: "assets/models/bookshelf.glb" },
    { id: "cupboard", category: "storage", name: "Cupboard", dimensions: "H: 190cm W: 100cm D: 55cm", imagePath: "assets/images/cupboard.png", modelPath: "assets/models/cupboard.glb" },
    { id: "coffee-table", category: "table", name: "Coffee Table", dimensions: "H: 45cm W: 110cm D: 60cm", imagePath: "assets/images/coffee_table.png", modelPath: "assets/models/coffee_table.glb" },
    { id: "wood-table", category: "table", name: "Wood Table", dimensions: "H: 75cm W: 160cm D: 90cm", imagePath: "assets/images/wood_table.png", modelPath: "assets/models/wood_table.glb" }
  ];

  // --- PWA Install Button Logic ---
  let deferredPrompt;
  const installButton = document.getElementById('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });
  installButton.addEventListener('click', async () => {
    installButton.style.display = 'none';
    deferredPrompt.prompt();
  });
  window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    deferredPrompt = null;
  });

  // --- Slideshow Logic ---
  const slideshow = document.querySelector('.slideshow');
  if (slideshow) {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slideshowContainer = document.getElementById('slideshow-container');
    let currentIndex = 0;
    let slideInterval;
    const moveToSlide = (index) => { slideshow.style.transform = `translateX(-${index * 100}%)`; };
    const showNextSlide = () => { currentIndex = (currentIndex + 1) % slides.length; moveToSlide(currentIndex); };
    const showPrevSlide = () => { currentIndex = (currentIndex - 1 + slides.length) % slides.length; moveToSlide(currentIndex); };
    const startSlideShow = () => { slideInterval = setInterval(showNextSlide, 5000); };
    const stopSlideShow = () => { clearInterval(slideInterval); };
    nextBtn.addEventListener('click', showNextSlide);
    prevBtn.addEventListener('click', showPrevSlide);
    slideshowContainer.addEventListener('mouseover', stopSlideShow);
    slideshowContainer.addEventListener('mouseout', startSlideShow);
    startSlideShow();
  }

  // --- Auth Modal & Form Logic (Connects to Backend) ---
  const authModal = document.getElementById('auth-modal');
  const loginNavBtn = document.getElementById('login-nav-btn');
  const authModalCloseBtn = document.getElementById('auth-modal-close-btn');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const showLoginLink = document.getElementById('show-login');
  const showSignupLink = document.getElementById('show-signup');

  if (loginNavBtn) loginNavBtn.addEventListener('click', () => authModal.style.display = 'flex');
  if (authModalCloseBtn) authModalCloseBtn.addEventListener('click', () => {
      authModal.style.display = 'none';
      pendingAction = null; // Cancel pending action if modal is closed
  });
  
  if (showLoginLink) showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  if (showSignupLink) showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });

  // --- Functions to execute actions after successful login ---
  function executePendingAction() {
    if (!pendingAction) return;

    if (pendingAction.action === 'view') {
        loadModel(pendingAction.card);
    } else if (pendingAction.action === 'snapshot') {
        takeSnapshot(pendingAction.card);
    }
    pendingAction = null; // Clear the action after executing it
  }

  if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        const res = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(data.msg || "An error occurred.");
        if(res.ok) {
            isLoggedIn = true;
            authModal.style.display = 'none';
            loginNavBtn.textContent = `Welcome, ${username}`;
            loginNavBtn.disabled = true;
            executePendingAction();
        }
    } catch (err) {
        alert("Failed to connect to the server.");
    }
  });

  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(data.msg || "An error occurred.");
        if(res.ok) {
            isLoggedIn = true;
            authModal.style.display = 'none';
            loginNavBtn.textContent = `Welcome, ${username}`;
            loginNavBtn.disabled = true;
            executePendingAction();
        }
    } catch (err) {
        alert("Failed to connect to the server.");
    }
  });

  // --- Search and Filter Logic ---
  const searchBar = document.getElementById('search-bar');
  const filterButtons = document.querySelectorAll('.filter-btn');
  function filterProducts() {
    const allProductCards = document.querySelectorAll('.product-card');
    const searchQuery = searchBar.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
    allProductCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const category = card.dataset.category;
      const matchesSearch = name.includes(searchQuery);
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);
      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
  if(searchBar) searchBar.addEventListener('input', filterProducts);
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });

  // --- Helper functions for actions ---
  function loadModel(card) {
      const modelViewer = card.querySelector('model-viewer');
      if (modelViewer && !modelViewer.hasAttribute('src')) {
          modelViewer.setAttribute('src', modelViewer.dataset.src);
      }
  }

  async function takeSnapshot(card) {
      const modelViewer = card.querySelector('model-viewer');
      if (modelViewer) {
          const blob = await modelViewer.toBlob({ idealAspect: true });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `snapshot-${card.dataset.name}.png`;
          link.click();
          URL.revokeObjectURL(url);
      }
  }

  // --- Main function to setup event listeners on each card ---
  function setupEventListenersForCard(card) {
      const arButton = card.querySelector('.ar-button');
      if(arButton) arButton.addEventListener('click', () => {
          if (!isLoggedIn) {
              pendingAction = { action: 'view', card: card };
              authModal.style.display = 'flex';
          } else {
              loadModel(card);
          }
      });

      const snapshotButton = card.querySelector('.snapshot-btn');
      if(snapshotButton) snapshotButton.addEventListener('click', () => {
          if (!isLoggedIn) {
              pendingAction = { action: 'snapshot', card: card };
              authModal.style.display = 'flex';
          } else {
              takeSnapshot(card);
          }
      });

      const clickableArea = card.querySelector('img');
      if(clickableArea) clickableArea.addEventListener('click', () => {
          const allProductCards = document.querySelectorAll('.product-card');
          const relatedModal = document.getElementById('related-modal');
          const relatedItemsGrid = document.getElementById('related-items-grid');
          relatedItemsGrid.innerHTML = '';
          const relatedItems = Array.from(allProductCards).filter(item => item.dataset.category === card.dataset.category && item.id !== card.id);
          relatedItems.slice(0, 3).forEach(item => {
              const clonedCard = item.cloneNode(true);
              setupEventListenersForCard(clonedCard); // Re-attach listeners to cloned cards
              relatedItemsGrid.appendChild(clonedCard);
          });
          if (relatedItems.length > 0) relatedModal.style.display = 'flex';
      });
  }

  // --- Related Items Modal Close Logic ---
  const relatedModal = document.getElementById('related-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => relatedModal.style.display = 'none');
  if (relatedModal) relatedModal.addEventListener('click', (event) => {
    if (event.target === relatedModal) relatedModal.style.display = 'none';
  });

  // --- Initial Data Loading Function ---
  const productGrid = document.querySelector('.product-grid');
  function loadFurniture() {
      productGrid.innerHTML = ''; // Clear grid
      furnitureData.forEach(item => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.id = `product-${item.id}`;
          card.dataset.category = item.category;
          card.dataset.name = item.name;
          card.innerHTML = `
              <img src="${item.imagePath}" alt="${item.name}">
              <h3>${item.name}</h3>
              <div class="product-dimensions"><p>${item.dimensions}</p></div>
              <model-viewer data-src="${item.modelPath}" alt="${item.name} Model" ar ar-placement="floor" auto-rotate camera-controls poster="${item.imagePath}"><div class="spinner" slot="progress-bar"></div></model-viewer>
              <div class="button-row">
                  <button class="btn ar-button">View in 3D/AR</button>
                  <button class="btn snapshot-btn">Snapshot 📸</button>
              </div>
          `;
          productGrid.appendChild(card);
          setupEventListenersForCard(card);
      });
  }

  loadFurniture(); // Load all the furniture when the page starts
});
