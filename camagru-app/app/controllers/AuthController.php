<?php
require_once BASE_PATH . '/app/models/User.php';

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
                $_SESSION['flash'] = 'Passwords do not match.';
                header("Location: index.php?page=register&error=not_match");
                exit;
            }

            $user = new User();
            if ($user->create($username, $email, $password)) {
                header("Location: index.php?page=login");
                exit;
            } else {
                $_SESSION['flash'] = 'Registration failed. Please try again.';
                header("Location: index.php?page=register&error=failed");
                exit;
            }
        }
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['login'] ?? '';
            $password = $_POST['password'] ?? '';

            $user = new User();
            if ($user->login($email, $password)) {
                session_start();
                $_SESSION['user_id'] = $user->getId();
                header("Location: index.php?page=gallery");
                exit;
            } else {
                $_SESSION['flash'] = 'Invalid email or password.';
                header("Location: index.php?page=login&error=invalid");
            }
        }
    }
}
