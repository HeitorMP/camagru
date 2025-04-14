<?php

define('BASE_PATH', dirname(__DIR__));

require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';


if (isset($_GET['code'])) {
    $activation_code = $_GET['code'];
    $user = new User();
    $result = false;
    $id = $user->getUserIdByActivationCode($activation_code);
    if ($id) {
        echo "User ID: $id";
        $result = $user->updateVerified($id, 1);
    }
    if ($result) {
        redirectWithFlash('login', 'Your account has been activated successfully. You can now log in.', 'success');
    } else {
        redirectWithFlash('login', 'Invalid activation code.', 'error');
    }
} else {
    redirectWithFlash('login', 'No activation code provided.', 'error');
}
