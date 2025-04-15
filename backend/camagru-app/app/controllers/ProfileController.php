<?php
require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';

class ProfileController {

    public function showEditProfile() {
        // session_start();
       
        redirectNoAccess('login');

        include BASE_PATH . '/app/views/layout/header.php';
        include BASE_PATH . '/app/views/edit_profile/edit_profile.php';
        include BASE_PATH . '/app/views/layout/footer.php';
    }

    public function updateUsername() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user = new User();
            $username = strtolower(trim($_POST['username'] ?? ''));
            $userId = $_SESSION['user_id'];

            if (empty($username)) {
                redirectWithFlash('edit_profile', message('auth.username_empty'), 'error');
            }

            if (!preg_match('/^[A-Za-z][A-Za-z\d]{7}$/', $username)) {
                redirectWithFlash('edit_profile', message('auth.invalid_username_pattern'), 'error');
            }

            if (!$user->checkUsernameAvailability($username)) {
                redirectWithFlash('edit_profile', message('auth.username_taken'), 'error');
            }

            if ($user->updateUsername($userId, $username)) {
                redirectWithFlash('profile', message('auth.username_update_success'), 'success');
            } else {
                redirectWithFlash('edit_profile', message('auth.generic_error'), 'error');
            }
        }
    }
}