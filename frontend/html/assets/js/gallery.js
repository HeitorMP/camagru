let csrfToken = null;
async function fetchCsrfToken() {
  try {
      const response = await fetch('/api/?page=auth_check', {
          method: 'GET',
          credentials: 'include'
      });
      const data = await response.json();
      csrfToken = data.csrf_token;
  } catch (error) {
      const flash = document.getElementById('flashMessage');
      flash.textContent = 'Csrf token invalid. Try again';
      flash.style.color = 'red';
  }
}

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

  await fetchCsrfToken();

  async function fetchPhotos() {
    try {
      const response = await fetch('/api/?page=get_gallery', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success' && data.photos.length > 0) {
        return data.photos;
      } else {
        return [];
      }
    } catch (err) {
      console.error('Erro ao carregar galeria:', err);
      return [];
    }
  }

  async function fetchSearch(username) {

    if (!csrfToken) {
      await fetchCsrfToken();
      if (!csrfToken) {
          flash.textContent = 'Erro: Token de segurança não disponível.';
          flash.style.color = 'red';
          return;
      }
  }
    
    try {
      const response = await fetch(`/api/?page=get_gallery_by_username`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, csrf_token: csrfToken })
      });
  
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
    if (username) {
      cards = await fetchSearch(username);
  
      if (errorMessage) {
        owner.innerHTML = `<h2 class="text-center text-danger">${errorMessage}</h2>`;
        errorMessage = "";
      } else {
        owner.innerHTML = `<h2 class="text-center">Gallery of <strong>${username}</strong></h2>`;
      }
    } else {
      cards = await fetchPhotos();
      owner.innerHTML = `<h2 class="text-center">My Gallery</h2>`;
    }
  
    totalPages = Math.ceil(cards.length / cardsPerPage);
    currentPage = 1;
    renderCards();
  }
  
  function  renderCards() {
    cardContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const pageCards = cards.slice(startIndex, endIndex);

    pageCards.forEach(async (image) => {
      let likesCount = 0;
      try {
        const response = await fetch(`/api/?page=get_like_count&image_id=${image.id}`, {
          method: 'GET',
          credentials: 'include',
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
      <h5>Likes: ${likesCount}</h5>
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
