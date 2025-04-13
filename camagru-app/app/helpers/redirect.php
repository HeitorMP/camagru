<?php
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    function setFlash($message, $type = 'success') {
        $_SESSION['flash'] = [
            'message' => $message,
            'type' => $type
        ];
    }
    
    function getFlash() {
        if (isset($_SESSION['flash'])) {
            $flash = $_SESSION['flash'];
            unset($_SESSION['flash']);
            return $flash;
        }
        return null;
    }
    

    function redirect($page) {
        $url = "index.php?page=" . $page;
        header("Location: $url");
        exit();
    }

    function redirectWithFlash($page, $message, $type = 'success') {
        setFlash($message, $type);
        redirect($page);
    }
    