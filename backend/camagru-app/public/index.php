<?php

// Configurações de erro para produção
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/error.log');
error_reporting(E_ALL);

// Configuração segura da sessão
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // manter 0 em local
ini_set('session.cookie_samesite', 'Lax');
session_start();

// Timeout de sessão (30 minutos)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    session_unset();
    session_destroy();
    session_start();
}
$_SESSION['last_activity'] = time();

// Gerar token CSRF se não existir
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Configurações CORS
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' http://localhost:8080");

$csrfExcludedRoutes = ['logout', 'activate'];



define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/config/database.php';
require BASE_PATH . '/app/controllers/AuthController.php';
require BASE_PATH . '/app/controllers/AccountController.php';
require BASE_PATH . '/app/controllers/EditorController.php';
require BASE_PATH . '/app/controllers/GalleryController.php';

$auth = new AuthController();
$account = new AccountController();
$editor = new ImageController();
$gallery = new GalleryController();

// Validar e rotear
$allowedRoutes = [
    'register', 'login', 'activate', 'update_username', 'update_email',
    'update_password', 'logout', 'auth_check', 'reset_password',
    'upload_photo', 'get_gallery', 'get_gallery_by_username', 'delete_photo',
    'get_public_profile', 'get_image', 'like_image', 'get_like_count', 'dislike_image',
    'get_comments', 'add_comment', 'delete_comment'
];
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_STRING) ?? 'login';
if (!in_array($page, $allowedRoutes)) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Route not found']);
    exit;
}


if (
    ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'DELETE')
    && !in_array($page, $csrfExcludedRoutes)
) {
    $csrfToken = '';

    // Se for JSON
    if (isset($_SERVER['CONTENT_TYPE']) && str_contains($_SERVER['CONTENT_TYPE'], 'application/json')) {
        $input = json_decode(file_get_contents("php://input"), true);
        $csrfToken = $input['csrf_token'] ?? '';
    }
    elseif (!empty($_POST['csrf_token'])) {
        $csrfToken = $_POST['csrf_token'];
    }

    if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrfToken)) {
        error_log("CSRF token mismatch. Sent: $csrfToken, Expected: {$_SESSION['csrf_token']}, IP: {$_SERVER['REMOTE_ADDR']}");
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'CSRF token mismatch']);
        exit;
    }
}

// Rotas
switch ($page) {
    case 'register':
        $auth->register();
        break;
    case 'login':
        $auth->login();
        break;
    case 'activate':
        $auth->activate();
        break;
    case 'update_username':
        $account->updateUsername();
        break;
    case 'update_email':
        $account->updateEmail();
        break;
    case 'update_password':
        $account->updatePassword();
        break;
    case 'logout':
        $auth->logout();
        break;
    case 'auth_check':
        $auth->checkAuth();
        break;
    case 'reset_password':
        $auth->resetPassword();
        break;
    case 'upload_photo':
        $editor->uploadImage();
        break;
    case 'get_gallery':
        $editor->getGallery();
        break;
    case 'get_gallery_by_username':
        $gallery->getGalleryByUsername();
        break;
    case 'get_public_profile':
        $gallery->getPublicProfile();
        break;
    case 'delete_photo':
        $editor->deleteImage();
        break;
    case 'get_image':
        $editor->getImage();
        break;
    case 'like_image':
        $gallery->likeImage();
        break;
    case 'dislike_image':
        $gallery->dislikeImage();
        break;
    case 'get_like_count':
        $gallery->getLikesCount();
        break;
    case 'get_comments':
        $gallery->getComments();
        break;
    case 'add_comment':
        $gallery->addComment();
        break;
    case 'delete_comment':
        $gallery->deleteComment();
        break;
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Route not found']);
        break;
}
?>