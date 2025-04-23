<?php

require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/mail_sender.php';
require_once BASE_PATH . '/app/helpers/sanitizer.php';
require_once BASE_PATH . '/app/helpers/auth.php';

class AuthController {

    //ajax register
    public function register() {
        header('Content-Type: application/json');
    
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $username = strtolower(trim($input['username'] ?? ''));
            $email = filter_var(trim($input['email'] ?? ''));
            $password = trim($input['password'] ?? '');
            $confirm_password = trim($input['confirm_password'] ?? '');

            $username = sanitizeText($username);
            $email = sanitizeEmail($email);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                response('error', null, 'Invalid email format');
                return;
            }
            $password = sanitizePassword($password);
            $confirm_password = sanitizePassword($confirm_password);

            $errors = verifyRegisterInput($username, $email, $password, $confirm_password);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }

            $user = new User();
            if (!$user->checkUsernameAvailability($username)) {
                response('error', null, message('auth.username_taken'));

            }
            if (!$user->checkEmailAvailability($email)) {
                response('error', null, message('auth.email_taken'));
                return;
            }
            
            // Create a new user sending the activation code
            $activation_code = generateActivationCode();
            $activation_code = sanitizeCode($activation_code);

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

            $username = sanitizeText($username);
            $password = sanitizePassword($password);

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

                session_regenerate_id(true); // Regenerate session ID to prevent session fixation attacks
                $_SESSION['user_id'] = $id;

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
            $email = filter_var(trim($input['email'] ?? ''));

            $email = sanitizeEmail($email);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                response('error', null, 'Invalid email format');
                return;
            }

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
            $input = json_decode(file_get_contents("php://input"), true);
            $csrfToken = $input['csrf_token'] ?? '';
    
            if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrfToken)) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'CSRF token inválido no logout.']);
                return;
            }
    
            error_log("Logout attempt from IP: {$_SERVER['REMOTE_ADDR']}");
            
            // Limpar e destruir sessão atual
            session_unset();
            session_destroy();

            // Força novo ID de sessão para evitar fixação
            session_start();
            session_regenerate_id(true);

            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));

            echo json_encode([
                'status' => 'success',
                'redirect' => '/login',
                'user_id' => $_SESSION['user_id'] ?? null,
                'csrf_token' => $_SESSION['csrf_token']
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        }
    }

    public function checkAuth() {
        header('Content-Type: application/json');
        
        echo json_encode([
            'authenticated' => isset($_SESSION['user_id']),
            'user_id' => $_SESSION['user_id'] ?? null,
            'csrf_token' => $_SESSION['csrf_token']
        ]);
    }
}