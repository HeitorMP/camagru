export function init() {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('message');
    const status = params.get('status');

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

    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
    
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
    
            console.log('Resposta do servidor:', data);
    
            const flash = document.getElementById('flashMessage');
            if (response.ok && data.status === 'success') {
                window.location.href = data.redirect;
            } else {
                flash.textContent = data.message || 'Login error!';
                flash.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    });
} 