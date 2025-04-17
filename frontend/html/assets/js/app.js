import { insertNavBar } from './navbar.js';

const routeModules = {
    '/register': () => import('./register.js'),
    '/login': () => import('./login.js'),
    '/activate': () => import('./activate.js'),
    '/editor': () => import('./editor.js'),
    '/account': () => import('./account.js'),
    '/logout': () => import('./logout.js'),
    '/update_username': () => import('./account.js'),
    '/update_email': () => import('./account.js'),
    '/update_password': () => import('./account.js'),
    '/gallery': () => import('./gallery.js'),
    '/reset_password': () => import('./reset_password.js'),
};

const routeHtml = {
    '/register': '/pages/register.html',
    '/login': '/pages/login.html',
    '/gallery': '/pages/gallery.html',
    '/editor': '/pages/editor.html',
    '/activate': '/pages/activate.html',
    '/account': '/pages/account.html',
    '/logout': '/pages/logout.html',
    '/update_username': '/pages/account.html',
    '/update_email': '/pages/account.html',
    '/update_password': '/pages/account.html',
    '/reset_password': '/pages/reset_password.html',
};

// protected routes
const privateRoutes = ['/account', '/logout', '/gallery', '/editor', '/update_username', '/update_email', '/update_password'];

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
    // Redireciona para /login se acessar "/"
    if (path === '/') {
        const isAuth = await checkAuth();

        window.location.href = isAuth ? '/gallery' : '/login';
    }

    if (privateRoutes.includes(path)) {
        const isAuth = await checkAuth();
        if (!isAuth) {
            window.location.href = '/login';
            return;
        }

        const body = document.querySelector('body');
        body.insertAdjacentHTML('afterbegin', insertNavBar());
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

loadPage(path);
