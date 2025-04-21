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
    const form = document.getElementById('registerForm');
    if (!form) return;

    await fetchCsrfToken();
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirm_password = document.getElementById('confirmPassword').value.trim();


        try {
            const response = await fetch('/api/?page=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, confirm_password, csrf_token: csrfToken }),
            });
     
            const data = await response.json();
            console.log('Resposta do servidor:', data);

            const flash = document.getElementById('flashMessage');
            if (response.ok && data.status === 'success') {
                localStorage.setItem('flashMessage', data.message);
                localStorage.setItem('flashStatus', 'success');
                window.location.href = data.redirect;
            } else {
                flash.textContent = data.message || 'Erro';
                flash.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    });
}