export function init() {
    const form = document.getElementById('resetPasswordForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        try {
            const response = await fetch('/api/?page=reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email})
            });

            const data = await response.json();

            const flash = document.getElementById('flashMessage');
            if (response.ok && data.status === 'success') {
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