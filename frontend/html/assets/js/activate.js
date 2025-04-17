export async function init() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const email = params.get('email');

    if (code && email) {
        try {
            const url = '/api/?page=activate&code=' + code + '&email=' + email;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (response.ok) {
                window.location.href = data.redirect; 
            } else {
                window.location.href = '/login?status=error&message=Activation failed!';
            }
        }
        catch (error) {
            console.error('Erro:', error);
            window.location.href = '/login?status=error&message=Activation failed!';
        }
    }
    else {
        window.location.href = '/login';
    }
}