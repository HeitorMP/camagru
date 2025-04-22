let csrfToken = null;
let imageUrl = null;

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
        commentsContainer.innerHTML = `<p class="text-muted">Try again</p>`;
      }
    });
  }

  function generateShareButton(url) {
    return `<a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank"
                  class="btn btn-outline-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-facebook" viewBox="0 0 16 16">
                    <path
                      d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                  </svg>
                  <i class="bi bi-facebook"></i>
              </a>`;

  }
  
async function loadImage(id) {
  const response = await fetch(`/api/?page=get_image&id=${id}`);
  const data = await response.json();

  if (data.status === 'success') {
    const img = document.createElement('img');
    img.src = 'api/' + data.photo.image_path;
    img.alt = 'Imagem';
    imageUrl = img.src;

    const facebook = document.getElementById('facebook');
    if (facebook) {
      facebook.innerHTML = generateShareButton(img.src);
    }

    await getLikes(id).then((likesCount) => {
      const likesCountElement = document.getElementById('likes');
      likesCountElement.textContent = `Likes: ${likesCount}`;
    });
  
    document.getElementById('imageContainer').append(img);
  } else {
    document.getElementById('imageContainer').textContent = data.message || 'Erro ao carregar imagem.';
  }


}
  export async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
  
    loadImage(id);
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
              loadImage(id);
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
              loadImage(id);
            }
        });
    }

    document.getElementById("copy").addEventListener("click", () => {
      const url = imageUrl;
  
      navigator.clipboard.writeText(url)
      .then(() => {
        const toast = document.getElementById("customToast");
        toast.classList.add("show");

        setTimeout(() => {
          toast.classList.remove("show");
        }, 3000);
      })
      .catch(err => {
        console.error("Erro ao copiar:", err);
        alert("Erro ao copiar o link.");
      });
    });
    
    await loadComments(id);
    setupCommentForm(id);
}
