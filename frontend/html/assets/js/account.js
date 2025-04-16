export function init() {
    const flash = document.getElementById('flashMessage');

    document.getElementById('updateUsernameButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();

        try {
            const response = await fetch('/api/?page=update_username', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            //raw response

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                flash.textContent = data.message || 'Username updated successfully.';
                flash.style.color = 'green';
            } else {
                flash.textContent = data.message || 'Error updating username.';
                flash.style.color = 'red';
            }
        } catch (error) {
            console.error('Network error:', error);
            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
        
    });

    // update email
    document.getElementById('updateEmailButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        
        try {
            const response = await fetch('/api/?page=update_email', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
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
            console.error('Network error:', error);
            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
    });

    // update password
    document.getElementById('updatePasswordButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        
        try {
            const response = await fetch('/api/?page=update_password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, password, confirmPassword })
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
            console.error('Network error:', error);
            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
    });
    
}