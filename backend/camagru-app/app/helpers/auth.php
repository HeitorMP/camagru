<?php
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        response('error', '/login', message('auth.not_logged_in'));
        exit;
    }
}
