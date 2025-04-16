const routeModules = {
    '/register': () => import('./register.js'),
    '/login': () => import('./login.js'),
    '/activate': () => import('./activate.js'),
    '/account': () => import('./account.js'),
    '/logout': () => import('./logout.js'),
    '/update_username': () => import('./account.js'),
    '/update_email': () => import('./account.js'),
    '/update_password': () => import('./account.js'),
};

const routeHtml = {
    '/register': '/pages/register.html',
    '/login': '/pages/login.html',
    '/gallery': '/pages/gallery.html',
    '/activate': '/pages/activate.html',
    '/account': '/pages/account.html',
    '/logout': '/pages/logout.html',
    '/update_username': '/pages/account.html',
    '/update_email': '/pages/account.html',
    '/update_password': '/pages/account.html',
};

// rotas que exigem autenticação
const privateRoutes = ['/account', '/logout', '/gallery'];

const path = window.location.pathname;

async function checkAuth() {
    const res = await fetch('/api/?page=auth_check', {
        credentials: 'include'
    });
    const data = await res.json();
    console.log(data);
    return data.authenticated === true;
}

async function loadPage(path) {
    if (privateRoutes.includes(path)) {
        const isAuth = await checkAuth();
        if (!isAuth) {
            window.location.href = '/login';
            return;
        }
    }

    if (routeHtml[path]) {
        const html = await fetch(routeHtml[path]).then(res => res.text());
        document.getElementById('app').innerHTML = html;

        if (routeModules[path]) {
            const mod = await routeModules[path]();
            if (mod.init) mod.init();
        }
    }
}

// dispara carregamento da página
loadPage(path);
