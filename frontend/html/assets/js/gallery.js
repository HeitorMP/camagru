export async function init() {

    try {
      const response = await fetch('/api/?page=get_gallery', {
        credentials: 'include'
      });
  
      const data = await response.json();

      console.log('Resposta do servidor:', data);
  
      if (data.status === 'success' && data.photos.length > 0) {
        const container = document.querySelector('#nature .grid-container');
        container.innerHTML = ''; // limpa os mocks
  
        data.photos.forEach(image => {
          const item = document.createElement('div');
          item.classList.add('grid-item');
          let path = 'api/' + image.image_path;;
          item.innerHTML = `
            <img src="${path}" alt="Uploaded image">
            <div class="image-overlay">
              <h5>Uploaded Image</h5>
              <p class="mb-0">${new Date(image.created_at).toLocaleString()}</p>
            </div>
          `;
  
          container.appendChild(item);
        });
      } else {
        console.log('Nenhuma imagem encontrada.');
      }
    } catch (err) {
      console.error('Erro ao carregar galeria:', err);
    }
  }