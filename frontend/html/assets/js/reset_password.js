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
    const form = document.getElementById('resetPasswordForm');
    const resetButton = document.getElementById('reset-btn');
    if (!form) return;

    await fetchCsrfToken();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();

        if (!email) {
            const flash = document.getElementById('flashMessage');
            flash.textContent = 'Email is required';
            flash.style.color = 'red';
            return;
        }

        if(resetButton) {
            resetButton.setAttribute('disabled', 'disabled');
            resetButton.textContent = 'Loading...';
        }
        
        try {
            const response = await fetch('/api/?page=reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email, csrf_token: csrfToken})
            });

            const data = await response.json();

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
            alert('Network error. Please try again later.');
        }
        
        if(resetButton) {
            resetButton.removeAttribute('disabled');
            resetButton.textContent = 'Reset Password';
        }
    });
}