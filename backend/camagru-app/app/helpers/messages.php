<?php

require_once BASE_PATH . '/app/helpers/sanitizer.php';

function message($key) {
    static $messages = null;

    if ($messages === null) {
        $messages = require BASE_PATH . '/config/messages.php';
    }

    $keys = explode('.', $key);
    $msg = $messages;

    foreach ($keys as $k) {
        if (!isset($msg[$k])) return null;
        $msg = $msg[$k];
    }

    return sanitizeText($msg);
}
