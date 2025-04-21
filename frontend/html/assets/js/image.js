let csrfToken = null;

async function fetchCsrfToken() {
    try {
        const response = await fetch('/api/?page=auth_check', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        csrfToken = data.csrf_token;
        console.log('CSRF Token obtido:', csrfToken);
    } catch (error) {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Csrf token invalid. Try again';
        flash.style.color = 'red';
    }
}

async function getLikes(id) {
    let likesCount = 0;
    await fetchCsrfToken();
    try {
      const response = await fetch(`/api/?page=get_like_count`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_id: id, csrf_token: csrfToken }),
      });
      const data = await response.json();

      if (response.status === 200) {
        likesCount = data.count;
        console.log('Likes count:', likesCount);
      }
    } catch (error) {
      console.error('Error fetching likes count:', error);
    }
    return likesCount;
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
                alert('Imagem curtida com sucesso!');
                //reload gallery
                const relo = window.location.href;
                window.location.href = relo;
            } else {
                alert(data.message || 'Erro ao curtir imagem.');
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
                alert('dislike succefuly!');
                //reload gallery
                const relo = window.location.href;
                window.location.href = relo;
            } else {
                alert(data.message || 'error.');
            }
        });
    }
}
