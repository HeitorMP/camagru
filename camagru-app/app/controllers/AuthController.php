<?php
require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';

class AuthController {
    public function showLogin() {
        include BASE_PATH . '/app/views/layout/header.php';
        include BASE_PATH . '/app/views/auth/login.php';
        include BASE_PATH . '/app/views/layout/footer.php';
    }

    public function showRegister() {
        include BASE_PATH . '/app/views/layout/header.php';
        include BASE_PATH . '/app/views/auth/register.php';
        include BASE_PATH . '/app/views/layout/footer.php';
    }

    public function register() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $confirm_password = $_POST['confirm_password'] ?? '';

            if ($password !== $confirm_password) {
                redirectWithFlash('register', message('auth.password_mismatch'));
            }

            $user = new User();
            if ($user->create($username, $email, $password)) {
                redirectWithFlash('login', message('auth.register_success'));
            } else {
                redirectWithFlash('register', message('auth.register_failed'));
            }
        }
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['login'] ?? '';
            $password = $_POST['password'] ?? '';

            $user = new User();
            if ($user->login($email, $password)) {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user_id'] = $user->getId();
                redirectWithFlash('gallery', message('auth.login_success'));
                exit;
            } else {
                redirectWithFlash('login', message('auth.login_failed'));
            }
        }
    }
}
