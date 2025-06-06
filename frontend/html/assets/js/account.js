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

function validateUsername(username) {
    let errors = [];

    if (!username) {
        errors.push('Username can not be empty.');
    }

    if (!/^[A-Za-z][A-Za-z\d]{7,15}$/.test(username)) {
        errors.push('Username must start with a letter and be 8-16 characters long.');
    }

    return errors;
}

function validateEmail(email) {
    let errors = [];

    if (!email) {
        errors.push('Email can not be empty.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format.');
    }

    return errors;
}

function validatePassword(current, newPassword, confirmPassword) {
    let errors = [];

    if (!current || !newPassword || !confirmPassword) {
        errors.push('All fields are needed.');
    }

    if (newPassword !== confirmPassword) {
        errors.push('New password and confirmation do not match.');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(current)) {
        errors.push('Currrent password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }


    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(newPassword)) {
        errors.push('New Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, and one number.');
    }

    if (newPassword !== confirmPassword) {
        errors.push('New password and confirmation do not match.');
    }

    return errors;
}


async function toggleNotifications(current_checked_status) {

    try {
        const response = await fetch('/api/?page=update_email_notification', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ csrf_token: csrfToken, notifications_enabled: current_checked_status })
        });
        
        const data = await response.json();
        if (response.ok) {
            const flash = document.getElementById('flashMessage');
            flash.textContent = data.message || 'Notification settings updated successfully.';
            flash.style.color = 'green';
        }
    } catch (error) {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Network error. Please try again later.';
        flash.style.color = 'red';
    }
}

export async function init() {
    const flash = document.getElementById('flashMessage');
    const usernameBtn = document.getElementById('updateUsernameButton');
    const emailBtn = document.getElementById('updateEmailButton');
    const passwordBtn = document.getElementById('updatePasswordButton');

    await fetchCsrfToken();
    
    document.getElementById('updateUsernameButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        if (usernameBtn) {
            usernameBtn.textContent = 'Updating...';
            usernameBtn.disabled = true;
        }

        const errors = validateUsername(username);
        if (errors.length > 0) {
            flash.textContent = errors.join(' ');
            flash.style.color = 'red';
            if (usernameBtn) {
                usernameBtn.textContent = 'Update username';
                usernameBtn.disabled = false;
            }
            return;
        }
        
        if (!csrfToken) {
            await fetchCsrfToken();
            if (!csrfToken) {
                flash.textContent = 'Erro: Csrf Token Error, try again.';
                flash.style.color = 'red';
                return;
            }
        }

        try {
            const response = await fetch('/api/?page=update_username', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, csrf_token: csrfToken })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                flash.textContent = data.message || 'Username updated successfully.';
                flash.style.color = 'green';
            } else {
                flash.textContent = data.message || 'Error updating username.';
                flash.style.color = 'red';
            }
        } catch (error) {

            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
        if (usernameBtn) {
            usernameBtn.textContent = 'Update username';
            usernameBtn.disabled = false;
        }
        
    });

    // update email
    document.getElementById('updateEmailButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (emailBtn) {
            emailBtn.textContent = 'Updating...';
            emailBtn.disabled = true;
        }

        const errors = validateEmail(email);
        if (errors.length > 0) {
            flash.textContent = errors.join(' ');
            flash.style.color = 'red';
            if (emailBtn) {
                emailBtn.textContent = 'Update email';
                emailBtn.disabled = false;
            }
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
            const response = await fetch('/api/?page=update_email', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, csrf_token: csrfToken })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                flash.textContent = data.message || 'Email updated successfully.';
                flash.style.color = 'green';
            } else {
                flash.textContent = data.message || 'Error updating email.';
                flash.style.color = 'red';
            }
        } catch (error) {

            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
        if (emailBtn) {
            emailBtn.textContent = 'Update email';
            emailBtn.disabled = false;
        }
    });

    // update password
    document.getElementById('updatePasswordButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        if (passwordBtn) {
            passwordBtn.textContent = 'Updating...';
            passwordBtn.disabled = true;
        }

        const errors = validatePassword(currentPassword, password, confirmPassword);
        if (errors.length > 0) {
            flash.textContent = errors.join(' ');
            flash.style.color = 'red';
            if (passwordBtn) {
                passwordBtn.textContent = 'Update password';
                passwordBtn.disabled = false;
            }
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
            const response = await fetch('/api/?page=update_password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, password, confirmPassword, csrf_token: csrfToken })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                flash.textContent = data.message || 'Password updated successfully.';
                flash.style.color = 'green';
            } else {
                flash.textContent = data.message || 'Error updating password.';
                flash.style.color = 'red';
            }
        } catch (error) {

            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
        if (passwordBtn) {
            passwordBtn.textContent = 'Update password';
            passwordBtn.disabled = false;
        }
    });


    const checkbox = document.getElementById("flexCheckDefault");
    
    checkbox.addEventListener('change', function() {
        toggleNotifications(checkbox.checked);
    });
    try {
        const response = await fetch('/api/?page=get_email_notification', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        checkbox.checked = data.email_notifications;
    } catch (error) {
        flash.textContent = 'Network error. Please try again later.';
        flash.style.color = 'red';
    }
}