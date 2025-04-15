const routeModules = {
    '/register': () => import('./register.js'),
    '/login': () => import('./login.js'),
    '/activate': () => import('./activate.js'),
};

const routeHtml = {
    '/register': '/pages/register.html',
    '/login': '/pages/login.html',
    '/gallery': '/pages/gallery.html',
    '/activate': '/pages/activate.html',
};

const path = window.location.pathname;

if (routeHtml[path]) {
    fetch(routeHtml[path])
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;

            if (routeModules[path]) {
                routeModules[path]().then(mod => {
                    if (mod.init) mod.init();
                });
            }
        });
}
