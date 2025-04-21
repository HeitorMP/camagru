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
      const commentsContainer = document.getElementById('commentsContainer');
      commentsContainer.innerHTML = `<p class="text-muted">csrf token error, try again</p>`;
    }
}

async function getLikes(id) {
    let likesCount = 0;
    await fetchCsrfToken();
    try {
      const response = await fetch(`/api/?page=get_like_count&image_id=${id}`, {
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
      const commentsContainer = document.getElementById('commentsContainer');
      commentsContainer.innerHTML = `<p class="text-muted">csrf token error, try again</p>`;
    }
    return likesCount;
}

function renderComment({ owner_name, content, created_at }) {
    const commentCard = document.createElement('div');
    commentCard.className = 'card shadow-sm border-0';
    commentCard.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="card-subtitle text-muted mb-0"><strong>@${owner_name}</strong></h6>
          <small class="text-muted">${new Date(created_at).toLocaleString()}</small>
        </div>
        <p class="card-text">${content}</p>
      </div>
    `;
    return commentCard;
  }

  async function loadComments(imageId) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = ''; // limpa antes de renderizar
  
    try {
      const response = await fetch('/api/?page=get_comments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csrf_token: csrfToken, id: imageId })
      });
  
      const data = await response.json();
      if (data.status === 'success') {
        data.comments.forEach(comment => {
          const commentEl = renderComment(comment);
          commentsContainer.appendChild(commentEl);
        });
      } else {
        commentsContainer.innerHTML = `<p class="text-muted">${data.message}</p>`;
      }
    } catch (err) {
      commentsContainer.innerHTML = `<p class="text-danger">Erro ao carregar comentários.</p>`;
    }
  }

  function setupCommentForm(imageId) {
    const form = document.getElementById('commentForm');
    const textarea = document.getElementById('commentText');

  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const comment = textarea.value.trim();
      if (!comment) return;
  
      try {
        await fetchCsrfToken();
        const response = await fetch('/api/?page=add_comment', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: imageId,
            comment: comment,
            csrf_token: csrfToken
          })
        });
  
        const data = await response.json();
        const commentsContainer = document.getElementById('commentsContainer');
  
        if (data.status === 'success') {
          textarea.value = '';
          commentsContainer.innerHTML = `<p class="text-muted">${data.message}</p>`;
          loadComments(imageId); // recarrega comentários
        } else {
          commentsContainer.innerHTML = `<p class="text-muted">${data.message}</p>`;
        }
      } catch (err) {
        commentsContainer.innerHTML = `<p class="text-muted">${data.message}</p>`;
      }
    });
  }
  
  

  export async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
  
    const response = await fetch(`/api/?page=get_image&id=${id}`);
    const data = await response.json();
  
    if (data.status === 'success') {
      const img = document.createElement('img');
      img.src = 'api/' + data.photo.image_path;
      img.alt = 'Imagem';
  
      await getLikes(id).then((likesCount) => {
        const likesCountElement = document.getElementById('likes');
        likesCountElement.textContent = `Likes: ${likesCount}`;
      });
  
      document.getElementById('imageContainer').append(img);
    } else {
      document.getElementById('imageContainer').textContent = data.message || 'Erro ao carregar imagem.';
    }
  
    await fetchCsrfToken();
    const likeButton = document.getElementById('like-btn');
    if (likeButton) {
        likeButton.addEventListener('click', async () => {
            const res = await fetch(`/api/?page=like_image`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ id, csrf_token: csrfToken }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.status === 'success') {
                const relo = window.location.href;
                window.location.href = relo;
            }
        });
    }

    const dislikeButton = document.getElementById('dislike-btn');
    if (dislikeButton) {
        dislikeButton.addEventListener('click', async () => {
            const res = await fetch(`/api/?page=dislike_image`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ id, csrf_token: csrfToken }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            if (data.status === 'success') {
                const relo = window.location.href;
                window.location.href = relo;
            }
        });
    }

    await loadComments(id);
    setupCommentForm(id);
}
