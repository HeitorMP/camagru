export async function init() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const email = params.get('email');

    if (code && email) {
        try {
            const url = '/api/?page=activate';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, email })
            });

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                localStorage.setItem('flashMessage', data.message);
                localStorage.setItem('flashStatus', data.status);
                window.location.href = data.redirect; 
            }
        }
        catch (error) {
            localStorage.setItem('flashMessage', data.message);
            localStorage.setItem('flashStatus', data.status);
            window.location.href = data.redirect; 
        }
    }
    else {
        window.location.href = '/login';
    }
}