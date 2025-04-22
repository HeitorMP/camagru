import { insertLoggedInNavBar, insertNavBarGallery, insertLoggedOutNavBar } from './navbar.js';

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
    '/public': () => import('./public.js'),
    '/image': () => import('./image.js'),
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
    '/public': '/pages/public.html',
    '/image': '/pages/image.html',
};

// protected routes
const privateRoutes = ['/account', '/logout', '/gallery', '/editor', '/update_username', '/update_email', '/update_password'];

const path = window.location.pathname;
async function checkAuth() {
    const response = await fetch('/api/?page=auth_check', {
        credentials: 'include'
    });
    const data = await response.json();
    return data.authenticated === true;
}

function showErrorMessage(message) {
    const app = document.getElementById('app');
    app.innerHTML = `<div class="alert alert-danger text-center mt-4">${message}</div>`;
}

async function loadPage(path) {
    try {
        const isAuth = await checkAuth();

        if (path === '/') {
            window.location.href = isAuth ? '/gallery' : '/login';
            return;
        }

        const body = document.querySelector('body');

        if (privateRoutes.includes(path)) {
            if (!isAuth) {
                window.location.href = '/login';
                return;
            }

            if (path === '/gallery') {
                body.insertAdjacentHTML('afterbegin', insertNavBarGallery());
            } else {
                body.insertAdjacentHTML('afterbegin', insertLoggedInNavBar());
            }
        } else {
            if ((path === '/public' || path === '/image') && isAuth) {
                body.insertAdjacentHTML('afterbegin', insertLoggedInNavBar());
            } else {
                body.insertAdjacentHTML('afterbegin', insertLoggedOutNavBar());
            }
        }

        if (routeHtml[path]) {
            const res = await fetch(routeHtml[path]);   
            if (!res.ok) throw new Error('Failed to fetch HTML page');
            const html = await res.text();
            document.getElementById('app').innerHTML = html;

            if (routeModules[path]) {
                try {
                    const mod = await routeModules[path]();
                    if (mod.init) mod.init();
                } catch (err) {
                    showErrorMessage("Erro ao carregar a funcionalidade da página.");
                }
            }
        }
    } catch (err) {
        showErrorMessage("Reload.");
    }
}


loadPage(path);
