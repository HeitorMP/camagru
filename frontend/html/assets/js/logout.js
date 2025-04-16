export function init() {
    // limpa local/session storage se usado
    localStorage.clear();
    sessionStorage.clear();

    // tenta remover cookies que sejam acessíveis via JS (os HTTP-only não podem ser manipulados no client)
    document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // faz o logout no servidor
    fetch('/api/?page=logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.redirect) {
            console.log('Redirecting to:', data.redirect);
            window.location.href = data.redirect || '/login';
        } 
    })
    .catch(error => {
        console.error('Network error:', error);
    });
}
