<?php
function requireAuth() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        response('error', '/login', message('auth.not_logged_in'));
        exit;
    }
}