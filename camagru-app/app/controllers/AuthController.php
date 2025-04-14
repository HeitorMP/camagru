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

            // Sanitize and validate input
            $username = strtolower(trim($_POST['username'] ?? ''));
            $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            $password = trim($_POST['password'] ?? '');
            $confirm_password = trim($_POST['confirm_password'] ?? '');

            if (!preg_match('/^[A-Za-z][A-Za-z\d]{7}$/', $username)) {
                redirectWithFlash('register', message('auth.invalid_username_pattern'), 'error');
            }
            
            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/', $password)) {
                redirectWithFlash('register', message('auth.ivalid_password_pattern'), 'error');
            }

            if ($password !== $confirm_password) {
                redirectWithFlash('register', message('auth.password_mismatch'), 'error');
            }

            // Create a new user
            $user = new User();
            if ($user->create($username, $email, $password)) {
                redirectWithFlash('login', message('auth.register_success'), 'success');
            } else {
                redirectWithFlash('register', message('auth.register_failed'), 'error');
            }
        }
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Sanitize and validate input
            $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            $password = trim($_POST['password'] ?? '');
            
            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/', $password)) {
                redirectWithFlash('login', message('auth.ivalid_password_pattern'), 'error');
            }

            $user = new User();
            if ($user->login($email, $password)) {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user_id'] = $user->getId();
                redirectWithFlash('gallery', message('auth.login_success'), 'success');
            } else {
                redirectWithFlash('login', message('auth.login_failed'), 'error');
            }
        }
    }
}
