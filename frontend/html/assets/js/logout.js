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
        flash.textContent = 'CSRF token invalid. Try again';
        flash.style.color = 'red';
    }
}

function clearCookies() {
    document.cookie.split(";").forEach(cookie => {
        cookie = cookie.trim();
        if (!cookie) return; // Skip empty cookies
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) { // Only set cookie if name is non-empty
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
    });
}

export async function init() {

    try {
        await fetchCsrfToken();
    } catch (error) {
        alert('Error fetching CSRF token. Please try again.');
        return;
    }

    if (!csrfToken) {
        const flash = document.getElementById('flashMessage');
        if (flash) {
            flash.textContent = 'Error: Security token not available.';
            flash.style.color = 'red';
        }
        return;
    }

    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();

    // Send logout request
    try {

        const response = await fetch('/api/?page=logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ csrf_token: csrfToken })
        });

        const data = await response.json();

        if (data.csrf_token) {
            csrfToken = data.csrf_token;
        }

        if (data.status === 'success') {
            clearCookies();

            window.location.href = data.redirect || '/login';
        } else {
            const flash = document.getElementById('flashMessage');
            if (flash) {
                flash.textContent = data.message || 'Error while logging out.';
                flash.style.color = 'red';
            }
        }
    } catch (error) {
        const flash = document.getElementById('flashMessage');
        if (flash) {
            flash.textContent = 'Network or CSRF error. Please try again.';
            flash.style.color = 'red';
        }
    }
}
