<?php

require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/sanitizer.php';

class AccountController {

    //Ajax update username
    public function updateUsername() {
        
        header('Content-Type: application/json');

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

            if ($user->updateUsername($userId, $username)) {
                response('success', null, message('profile.username_update_success'));
            } else {
                response('error', null, message('profile.username_update_failed'));
            }
        }
    }
}