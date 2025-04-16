export function init() {

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