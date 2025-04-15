<?php

header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/config/database.php';
require BASE_PATH . '/app/controllers/AuthController.php';


$auth = new AuthController();

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
    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Route not found']);
        break;
}