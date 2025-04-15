<?php
require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/activation_code.php';
require_once BASE_PATH . '/app/helpers/sanitizer.php';

class AuthController {
    
    //ajax register
    public function register() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $username = strtolower(trim($input['username'] ?? ''));
            $email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            $password = trim($input['password'] ?? '');
            $confirm_password = trim($input['confirm_password'] ?? '');

            $errors = verifyRegisterInput($username, $email, $password, $confirm_password);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }
            // Create a new user
            $user = new User();
            $activation_code = generateActivationCode();
            if ($user->create($username, $email, $password, $activation_code)) {
                sendActivationEmail($email, $activation_code);
                response('success', '/login', message('auth.register_success'));
            } else {
                response('error', null, message('auth.register_failed'));
            }
        }
    }

    public function login() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $username = strtolower(trim($input['username'] ?? ''));
            $password = trim($input['password'] ?? '');

            $errors = verifyLoginInput($username, $password);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }

            $user = new User();
            if ($user->login($username, $password)) {
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user_id'] = $user->getId();
                $_SESSION['user_verified'] = $user->getVerified();
                response('success', '/gallery', message('auth.login_success'));
            } else {
                response('error', null, message('auth.login_failed'));
            }
        }
    }
    
    public function resetPassword() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Sanitize and validate input
            $email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                redirectWithFlash('reset_password', message('auth.invalid_email'), 'error');
            }

            $user = new User();
            if ($user->checkEmailAvailability($email)) {
                redirectWithFlash('reset_password', message('auth.email_not_found'), 'error');
            }

            $id = $user->getIdByEmail($email);
            if (!$id) {
                redirectWithFlash('login', message('auth.email_not_found'), 'error');
            }
            // Generate a password reset token
            // reset token must respect the regex
            $reset_token = generateRandomPassword();
            $user->updatePassword($id, $reset_token);
            // Send the password reset email
            sendResetPassword($email, $reset_token);
            redirectWithFlash('login', message('auth.reset_password_success'), 'success');
        }
    }

    public function activate() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $activation_code = trim($_GET['code'] ?? '');
            $email = filter_var(trim($_GET['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    
            if (empty($activation_code)) {
                response('error', '/login', message('auth.activation_code_missing'));
                return;
            }

            if (empty($email)) {
                response('error', '/login', message('auth.acivation_mail_missing'));
                return;
            }
    
            $user = new User();
            

            if ($user->checkActivationCode($activation_code, $email)) {
                response('success', '/login', message('auth.register_success'));
            } else {
                response('error', '/login', message('auth.activation_failed'));
            }
        }
    }
    

    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        unset($_SESSION['user_id']);
        session_destroy();
        redirectWithFlash('login', message('auth.logout_success'), 'success');
    }
}
