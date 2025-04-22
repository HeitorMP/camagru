let csrfToken = null;

async function fetchCsrfToken() {
    try {

        const response = await fetch('/api/?page=auth_check', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        csrfToken = data.csrf_token;

        if (!csrfToken) {
            throw new Error('CSRF token não retornado pelo servidor');
        }
    } catch (error) {
        console.error('Erro ao obter CSRF token:', error);
        const flash = document.getElementById('flashMessage');
        if (flash) {
            flash.textContent = 'Erro ao carregar token de segurança. Tente novamente.';
            flash.style.color = 'red';
        }
        throw error;
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
    // Obter CSRF token e aguardar conclusão
    try {
        await fetchCsrfToken();
    } catch (error) {
        console.warn('Falha ao obter CSRF token, abortando logout');
        return;
    }

    if (!csrfToken) {
        const flash = document.getElementById('flashMessage');
        if (flash) {
            flash.textContent = 'Erro: Token de segurança não disponível.';
            flash.style.color = 'red';
        }
        return;
    }

    // Limpar armazenamento local
    localStorage.clear();
    sessionStorage.clear();

    // Enviar requisição de logout
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


        // Atualizar CSRF token se retornado
        if (data.csrf_token) {
            csrfToken = data.csrf_token;

        }

        // Limpar cookies após logout bem-sucedido
        if (data.status === 'success') {
            clearCookies();

            window.location.href = data.redirect || '/login';
        } else {
            const flash = document.getElementById('flashMessage');
            if (flash) {
                flash.textContent = data.message || 'Erro ao fazer logout.';
                flash.style.color = 'red';
            }
        }
    } catch (error) {
        console.error('Erro de rede ou CSRF:', error);
        const flash = document.getElementById('flashMessage');
        if (flash) {
            flash.textContent = 'Erro de rede ou CSRF. Tente novamente.';
            flash.style.color = 'red';
        }
    }
}