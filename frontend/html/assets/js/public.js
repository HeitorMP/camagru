
export async function init() {
  const cardsPerPage = 12;
  const cardContainer = document.getElementById('card-container');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const pageNumbers = document.getElementById('page-numbers');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-username');
  const owner = document.getElementById('gallery-owner');
  let errorMessage = "";

  let currentPage = 1;
  let totalPages = 1;
  let cards = [];

  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCards();
    }
  });

  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderCards();
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const username = searchInput.value.trim();
      await loadGallery(username);
    });
  }


  async function fetchAllImages() {
    
    try {
        const response = await fetch(`/api/?page=get_public_profile`);
  
      const data = await response.json();
  
      if (data.status === 'success' && data.photos.length > 0) {
        return data.photos;
      } else {
        if (data.message) {
          errorMessage = data.message;
        }
        return [];
      }
    } catch (err) {
      console.error('Erro ao carregar galeria:', err);
      return [];
    }
  }

  async function loadGallery(username = '') {

    cards = await fetchAllImages();
    owner.innerHTML = `<h2 class="text-center">Public Gallery</h2>`;
    totalPages = Math.ceil(cards.length / cardsPerPage);
    currentPage = 1;
    renderCards();
  }
  
  async function renderCards() {
    cardContainer.innerHTML = '';
    let likesCount = 0;
    
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = cards.slice(startIndex, endIndex);
    
    pageCards.forEach(async image => {
        try {
          const response = await fetch(`/api/?page=get_like_count&image_id=${image.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
          });
          const data = await response.json();
    
          if (response.status === 200) {
            likesCount = data.count;

          }
        } catch (error) {
          console.error('Error fetching likes count:', error);
        }
      const item = document.createElement('div');
      item.classList.add('grid-item', 'card');
      const path = 'api/' + image.image_path;
      const imageUrl = `/image?id=${image.id}`;
      item.innerHTML = `
      <img src="${path}" alt="Uploaded image">
      <div class="image-overlay">
      <a href="${imageUrl}">
      <h5 class="mb-0">${image.owner_name}</h5>
      <h6>Likes: ${likesCount}</h6>
      <p class="mb-0">${new Date(image.created_at).toLocaleString()}</p>
      </a>
      </div>
      `;
      cardContainer.appendChild(item);
    });

    updatePagination();
  }

  function updatePagination() {
    const maxVisiblePages = 6;
    totalPages = Math.ceil(cards.length / cardsPerPage);

    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    pageNumbers.innerHTML = '';

    for (let i = startPage; i <= endPage; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.classList.add('page-link');
      pageLink.dataset.page = i;
      pageLink.textContent = i;
      if (i === currentPage) {
        pageLink.classList.add('active');
      }

      pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage !== i) {
          currentPage = i;
          renderCards();
        }
      });

      pageNumbers.appendChild(pageLink);
    }

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
  }

  // Inicia carregando a galeria do usuário atual
  await loadGallery();
}
