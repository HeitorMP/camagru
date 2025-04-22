let csrfToken = null;

async function fetchCsrfToken() {
    try {
        const response = await fetch('/api/?page=auth_check', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        csrfToken = data.csrf_token || null;

    } catch (error) {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Csrf token invalid. Try again';
        flash.style.color = 'red';
    }
}

export async function init() {
    const params = new URLSearchParams(window.location.search);
    const msg = localStorage.getItem('flashMessage') || params.get('msg');
    const status = localStorage.getItem('flashStatus') || params.get('status');

    if (msg && status) {
        const flash = document.getElementById('flashMessage');
        if (status === 'error') {
            flash.textContent = msg;
            flash.style.color = 'red';
        } else if (status === 'success') {
            flash.textContent = msg;
            flash.style.color = 'green';
        }
    }
    // Clear flash message from local storage
    localStorage.removeItem('flashMessage');
    localStorage.removeItem('flashStatus');
    // remove params from url
    window.history.replaceState({}, document.title, window.location.pathname);


    await fetchCsrfToken();

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        
        const loginButton = document.getElementById('login-btn');
        if (loginButton) {
            loginButton.textContent = 'Trying to log in...';
            loginButton.disabled = true;
        }
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const flash = document.getElementById('flashMessage');
        
        if (!username || !password) {
            flash.textContent = 'All fields are needed.';
            flash.style.color = 'red';
            return;
        }
    
        if (!csrfToken) {
            await fetchCsrfToken();
            if (!csrfToken) {
                flash.textContent = 'Erro: Token de segurança não disponível.';
                flash.style.color = 'red';
                return;
            }
        }
    
        try {
            const response = await fetch('/api/?page=login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, csrf_token: csrfToken })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {              
                window.location.href = data.redirect;
            } else {
                flash.textContent = data.message || 'Invalid username or password.';
                flash.style.color = 'red';
            }
    
        } catch (error) {
            flash.textContent = 'Erro de rede. Tente novamente mais tarde.';
            flash.style.color = 'red';
        }
        
        if (loginButton) {
            loginButton.textContent = 'Log in now';
            loginButton.disabled = false;
        }
    });
} 