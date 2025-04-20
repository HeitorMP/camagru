export function init() {
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

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
    
        const flash = document.getElementById('flashMessage');
    
        try {
            const response = await fetch('/api/?page=login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {              
                window.location.href = data.redirect;
            } else {
                flash.textContent = data.message || 'Invalid username or password.';
                flash.style.color = 'red';
            }
    
        } catch (error) {
            console.error('Erro de rede ou fatal:', error);
            flash.textContent = 'Erro de rede. Tente novamente mais tarde.';
            flash.style.color = 'red';
        }
    });
} 