<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/config/database.php';
require BASE_PATH . '/app/controllers/AuthController.php';
require BASE_PATH . '/app/controllers/AccountController.php';

$auth = new AuthController();
$account = new AccountController();

// Routes
$page = $_GET['page'] ?? 'login';

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
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Route not found']);
        break;
}
