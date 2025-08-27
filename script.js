document.addEventListener('DOMContentLoaded', () => {

  // PWA Install Button Logic
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
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    installButton.style.display = 'none';
    deferredPrompt = null;
    console.log('PWA was installed');
  });

  // Slider pause on hover
  const slides = document.querySelector(".slides");
  if (slides) {
    slides.addEventListener("mouseover", () => {
      slides.style.animationPlayState = "paused";
    });
    slides.addEventListener("mouseout", () => {
      slides.style.animationPlayState = "running";
    });
  }

  // Lazy load model-viewer
  document.querySelectorAll('.ar-button').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const modelViewer = card.querySelector('model-viewer');

      if (!modelViewer.hasAttribute('src')) {
        const modelSrc = modelViewer.dataset.src;
        modelViewer.setAttribute('src', modelSrc);
        console.log("Loading model:", modelSrc);
      }
    });
  });

  // Search and Filter Logic
  const searchBar = document.getElementById('search-bar');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  function filterProducts() {
    const searchQuery = searchBar.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

    productCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const category = card.dataset.category;
      
      const matchesSearch = name.includes(searchQuery);
      const matchesCategory = (activeCategory === 'all' || category === activeCategory);

      if (matchesSearch && matchesCategory) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  searchBar.addEventListener('input', filterProducts);

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });
});