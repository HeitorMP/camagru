<?php

require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/sanitizer.php';
require_once BASE_PATH . '/app/helpers/auth.php';

class AccountController {

    //Ajax update username
    public function updateUsername() {
        
        header('Content-Type: application/json');

        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $username = strtolower(trim($input['username'] ?? ''));
            $userId = $_SESSION['user_id'];

            if (!isset($userId)) {
                response('error', '/login', message('auth.not_logged_in'));
                return;
            }

            $errors = verifyUsernameInput($username);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }

            $user = new User();
            veriftUsernameAvailability($username);
            if (!$user->checkUsernameAvailability($username)) {
                response('error', null, message('profile.username_already_exists'));
                return;
            }

            if ($user->updateUsername($userId, $username)) {
                response('success', null, message('profile.username_update_success'));
            } else {
                response('error', null, message('profile.username_update_failed'));
            }
        }
    }

    //Ajax update email
    public function updateEmail() {
        
        header('Content-Type: application/json');

        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $email = strtolower(trim($input['email'] ?? ''));
            $userId = $_SESSION['user_id'];

            if (!isset($userId)) {
                response('error', '/login', message('auth.not_logged_in'));
                return;
            }

            $errors = verifyEmailInput($email);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }

            $user = new User();
            if (!user->checkEmailAvailability($email)) {
                response('error', null, message('profile.email_already_exists'));
                return;
            }
            if ($user->updateEmail($userId, $email)) {
                response('success', null, message('profile.email_update_success'));
            } else {
                response('error', null, message('profile.email_update_failed'));
            }
        }
    }

    //Ajax update password
    public function updatePassword() {
        
        header('Content-Type: application/json');

        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents("php://input"), true);
            $currentPassword = trim($input['currentPassword'] ?? '');
            $newPassword = trim($input['password'] ?? '');
            $confirmPassword = trim($input['confirmPassword'] ?? '');
            $userId = $_SESSION['user_id'];

            if (!isset($userId)) {
                response('error', '/login', message('auth.not_logged_in'));
                return;
            }

            $errors = verifyPasswordInput($newPassword, $confirmPassword);
            if (!empty($errors)) {
                response('error', null, $errors);
                return;
            }

            $user = new User();
            if (!$user->verifyCurrentPassword($userId, $currentPassword)) {
                response('error', null, message('profile.current_password_incorrect'));
                return;
            }
            if ($user->updatePassword($userId, $newPassword)) {
                response('success', null, message('profile.password_update_success'));
            } else {
                response('error', null, message('profile.password_update_failed'));
            }
        }
    }
}