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

            $user = new User();
            // Check if the username or email already exists
            if (!$user->checkUsernameAvailability($username)) {
                response('error', null, message('auth.username_taken'));
                return;
            }
            if (!$user->checkUsernameAvailability($email)) {
                response('error', null, message('auth.email_taken'));
                return;
            }
            
            // Create a new user sending the activation code
            $activation_code = generateActivationCode();
            if ($user->create($username, $email, $password, $activation_code)) {
                sendActivationEmail($email, $activation_code);
                response('success', '/login', message('auth.register_success'));
            } else {
                response('error', null, message('auth.register_failed'));
            }
        }
    }

    //ajax login
    public function login() {
        // header('Content-Type: application/json');
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
    
    //ajax reset password
    public function resetPassword() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);

            $errors = verifyLoginInput($email);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }
        
            $user = new User();
            // Check if the email exists
            if ($user->checkEmailExists($email)) {
                response('error', null, message('auth.email_not_found'));
                return;
            }
            // Generate a password reset token
            // reset token must respect the regex
            $reset_token = generateRandomPassword();
            $user->updatePassword($id, $reset_token);
            // Send the password reset email
            sendResetPassword($email, $reset_token);
            response('success', '/login', message('auth.reset_password_success'));
        }
    }

    //ajax activation
    public function activate() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $activation_code = trim($_GET['code'] ?? '');
            $email = filter_var(trim($_GET['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    
            $errors = verifyActivationInput($activation_code, $email);
            if (!empty($errors)) {
                response('error', '/login', $errors);
                return;
            }

            $user = new User();

            if ($user->checkActivationCode($activation_code, $email)) {
                response('success', '/login', message('auth.activation_success'));
            } else {
                response('error', '/login', message('auth.activation_failed'));
            }
        }
    }
    
    //ajax logout
    public function logout() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            unset($_SESSION['user_id']);
            session_destroy();
            response('success', '/login', message('auth.logout'));
        }
    }

    public function checkAuth() {
        header('Content-Type: application/json');

        // Verifica se o ID do usuário está na sessão
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                'authenticated' => true,
                'user_id' => $_SESSION['user_id']
            ]);
        } else {
            echo json_encode([
                'authenticated' => false
            ]);
        }
    }
}