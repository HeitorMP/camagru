<?php
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        response('error', '/login', message('auth.not_logged_in'));
        exit;
    }
    if (isset($_SESSION['user_verified']) && $_SESSION['user_verified'] == 0) {
        response('error', '/login', message('auth.not_verified'));
        exit;
    }
}
