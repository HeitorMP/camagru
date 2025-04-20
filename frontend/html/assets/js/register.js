export function init() {
    const form = document.getElementById('registerForm');
    if (!form) return;

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
                body: JSON.stringify({ username, email, password, confirm_password })
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