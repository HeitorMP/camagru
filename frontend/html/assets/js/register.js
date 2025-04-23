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

function validateInputs(username, email, password, confirm_password) {
    let errors = [];

    if (!username || !password || !email, !confirm_password) {
        errors.push('All fields are needed.');
    }

    if (!/^[A-Za-z][A-Za-z\d]{7,15}$/.test(username)) {
        errors.push('Username must start with a letter and be 8-16 characters long.');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(password)) {
        errors.push('Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    if (password !== confirm_password) {
        errors.push('Passwords do not match.');
    }

    return errors;
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
        const flash = document.getElementById('flashMessage');
        const registerButton = document.getElementById('register-btn');

        const errors = validateInputs(username, email, password, confirm_password);

        if (errors.length > 0) {
            flash.textContent = errors.join(' ');
            flash.style.color = 'red';
            return;
        }

        try {
            if (registerButton) {
                registerButton.textContent = 'Trying to register...';
                registerButton.disabled = true;
            }

            const response = await fetch('/api/?page=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, confirm_password, csrf_token: csrfToken }),
            });
     
            const data = await response.json();

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
        if (registerButton) {
            registerButton.textContent = 'Create account';
            registerButton.disabled = false;
        }
    });
}