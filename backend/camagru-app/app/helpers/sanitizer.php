<?php

require_once BASE_PATH . '/app/models/User.php';



function sanitizeText($text) {
    return htmlspecialchars(trim($text), ENT_QUOTES, 'UTF-8');
}

function sanitizeEmail($email) {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

function sanitizePassword($password) {
    return trim($password);
}

function sanitizeForHTML($text) {
    return htmlspecialchars(trim($text), ENT_QUOTES, 'UTF-8');
}

function sanitizeCode($code) {
    return preg_replace('/[^a-zA-Z0-9]/', '', trim($code));
}

function sanitizeBoolean($value) {
    return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
}




function verifyLoginInput($username, $password) {
    $errors = [];

    if (empty($username)) {
        $errors[] = message('auth.empty_username');
    }
    if (empty($password)) {
        $errors[] = message('auth.empty_password');
    }
    if (!preg_match('/^[A-Za-z][A-Za-z\d]{7,15}$/', $username)) {
        $errors[] = message('auth.invalid_username_pattern');
    }
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/', $password)) {
        $errors[] = message('auth.ivalid_password_pattern');
    }
    return $errors;
}

function verifyRegisterInput($username, $email, $password, $confirm_password) {
    $errors = [];

    if (empty($username)) {
        $errors[] = message('auth.empty_username');
    }
    if (empty($email)) {
        $errors[] = message('auth.empty_email');
    }
    if (empty($password)) {
        $errors[] = message('auth.empty_password');
    }
    if (empty($confirm_password)) {
        $errors[] = message('auth.empty_confirm_password');
    }
    if (!preg_match('/^[A-Za-z][A-Za-z\d]{7,15}$/', $username)) {
        $errors[] = message('auth.invalid_username_pattern');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = message('auth.invalid_email');
    }
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/', $password)) {
        $errors[] = message('auth.ivalid_password_pattern');
    }
    if ($password !== $confirm_password) {
        $errors[] = message('auth.password_mismatch');
    }
    return $errors;
}

function verifyResetPasswordInput($email) {
    $errors = [];

    if (empty($email)) {
        $errors[] = message('auth.empty_email');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = message('auth.invalid_email');
    }
    return $errors;
}

function verifyActivationInput($activation_code, $activation_email) {
    $errors = [];

    if (empty($activation_code)) {
        $errors[] = message('auth.activation_code_missing');
    }
    if (empty($activation_email)) {
        $errors[] = message('auth.acivation_mail_missing');
    }
    return $errors;
}

function verifyUsernameInput($username) {
    $errors = [];

    if (empty($username)) {
        $errors[] = message('auth.empty_username');
    }
    if (!preg_match('/^[A-Za-z][A-Za-z\d]{7,15}$/', $username)) {
        $errors[] = message('auth.invalid_username_pattern');
    }
    return $errors;
}

function verifyEmailInput($email) {
    $errors = [];
    if (empty($email)) {
        $errors[] = message('auth.empty_email');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = message('auth.invalid_email');
    }

    return $errors;
}

function verifyPasswordInput($password, $confirm_password) {
    $errors = [];

    if (empty($password)) {
        $errors[] = message('auth.empty_password');
    }
    if (empty($confirm_password)) {
        $errors[] = message('auth.empty_confirm_password');
    }
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/', $password)) {
        $errors[] = message('auth.ivalid_password_pattern');
    }
    if ($password !== $confirm_password) {
        $errors[] = message('auth.password_mismatch');
    }
    return $errors;
}