<?php

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/config/database.php';

// Rotas básicas
$page = $_GET['page'] ?? 'login';

switch ($page) {
    case 'login':
        require BASE_PATH . '/app/controllers/AuthController.php';
        (new AuthController())->showLogin();
        break;

    case 'login_submit':
        require BASE_PATH . '/app/controllers/AuthController.php';
        (new AuthController())->login();
        break;
    
        case 'register':
        require BASE_PATH . '/app/controllers/AuthController.php';
        (new AuthController())->showRegister();
        break;

    case 'register_submit':
        require BASE_PATH . '/app/controllers/AuthController.php';
        (new AuthController())->register();
        break;
    
    case 'gallery':
        require BASE_PATH . '/app/controllers/GalleryController.php';
        (new GalleryController())->showGallery();
        break;

    case 'logout':
        session_start();
        session_destroy();
        header('Location: index.php?page=login');
        exit();
    default:
        http_response_code(404);
        echo "Página não encontrada.";
        break;
}
