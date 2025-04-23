<?php
function requireAuth($message = null) { 
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        if ($message) {
            response('error', '/login', $message);
        } else {
            response('error', '/login', message('auth.not_logged_in'));
        }
        exit;
    }
}