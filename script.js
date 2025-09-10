document.addEventListener('DOMContentLoaded', () => {

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
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
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

  // --- Lazy load model-viewer ---
  document.querySelectorAll('.ar-button').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const modelViewer = card.querySelector('model-viewer');
      if (!modelViewer.hasAttribute('src')) {
        const modelSrc = modelViewer.dataset.src;
        modelViewer.setAttribute('src', modelSrc);
      }
    });
  });

  // --- Search and Filter Logic ---
  const searchBar = document.getElementById('search-bar');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const allProductCards = document.querySelectorAll('.product-card'); // Use this for filtering
  function filterProducts() {
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
  searchBar.addEventListener('input', filterProducts);
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProducts();
    });
  });

  // --- NEW: Snapshot Button Logic ---
  document.querySelectorAll('.snapshot-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const card = button.closest('.product-card');
      const modelViewer = card.querySelector('model-viewer');
      if (modelViewer) {
        const blob = await modelViewer.toBlob({ idealAspect: true });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ar-snapshot-${card.dataset.name.toLowerCase().replace(' ','-')}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  });

  // --- NEW: Related Items Modal Logic ---
  const relatedModal = document.getElementById('related-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const relatedItemsGrid = document.getElementById('related-items-grid');
  allProductCards.forEach(card => {
    const clickableArea = card.querySelector('img');
    clickableArea.addEventListener('click', () => {
      const currentId = card.id;
      const currentCategory = card.dataset.category;
      relatedItemsGrid.innerHTML = '';
      const relatedItems = Array.from(allProductCards).filter(item => {
        return item.dataset.category === currentCategory && item.id !== currentId;
      });
      relatedItems.slice(0, 3).forEach(item => {
        const clonedCard = item.cloneNode(true);
        relatedItemsGrid.appendChild(clonedCard);
      });
      if (relatedItems.length > 0) {
        relatedModal.style.display = 'flex';
      }
    });
  });
  modalCloseBtn.addEventListener('click', () => { relatedModal.style.display = 'none'; });
  relatedModal.addEventListener('click', (event) => {
    if (event.target === relatedModal) { relatedModal.style.display = 'none'; }
  });
});
