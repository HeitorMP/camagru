export async function init() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log('Código de ativação:', code);
    if (code) {
        try {
            const url = '/api/?page=activate&code=' + code;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ code }),
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (response.ok) {
                window.location.href = data.redirect; 
            } else {
                window.location.href = '/login?message=Activation failed!';
            }
        }
        catch (error) {
            console.error('Erro:', error);
            window.location.href = '/login?message=Activation failed!';
        }
    }
    else {
        window.location.href = '/login';
    }
}