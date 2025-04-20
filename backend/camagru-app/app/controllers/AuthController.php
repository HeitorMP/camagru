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

            }
            if (!$user->checkEmailAvailability($email)) {
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

            // Check is verified
            
            if ($user->login($username, $password)) {
                $id = $user->getIdByUsername($username);
                
                if (!$user->getIsVerifyStatus($id)) {
                    response('error', null, message('auth.not_verified'));
                    return;
                }
                ini_set('session.cookie_samesite', 'Lax');
                ini_set('session.cookie_secure', '0');
                session_start();

                $_SESSION['user_id'] = $id;

                // if (session_status() === PHP_SESSION_NONE) {
                //     ini_set('session.cookie_samesite', 'Lax');
                //     session_start();
                // }
                // $_SESSION['user_id'] = $id;
                response('success', '/gallery', null);
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

            $errors = verifyEmailInput($email);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }
        
            $user = new User();
            // Check if the email exists
            if ($user->checkEmailAvailability($email)) {
                response('error', null, message('auth.email_not_found'));
                return;
            }
            // Generate a password reset token
            // reset token must respect the regex
            $reset_token = generateRandomPassword();
            $id = $user->getIdByEmail($email);
            if ($user->updatePassword($id, $reset_token)) {
                // Send the password reset email
                sendResetPassword($email, $reset_token);
                response('success', '/login', message('auth.reset_password_success'));
            } else {
                response('error', null, message('auth.reset_password_failed'));
            }
         }   
    }

    //ajax activation
    public function activate() {
        header('Content-Type: application/json');
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $activation_code = trim($input['code'] ?? '');
            $email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    
            $errors = verifyActivationInput($activation_code, $email);
            if (!empty($errors)) {
                response('error', '/login', $errors);
                return;
            }

            $user = new User();

            if (!$user->checkActivationCode($activation_code, $email)) {
                response('error', '/login', message('auth.activation_code_invalid'));
                return;
            }

            $id = $user->getIdByEmail($email);
            if ($user->activateUser($id, 1)) {
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
        ini_set('session.cookie_samesite', 'Lax');
        ini_set('session.cookie_secure', '0'); // só se NÃO usar https
        session_start();

        
        echo json_encode([
          'authenticated' => isset($_SESSION['user_id']),
          'user_id' => $_SESSION['user_id'] ?? null,
        ]);
    }
}