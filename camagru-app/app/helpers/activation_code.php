<?php

    function generateActivationCode($length = 16) {
        return bin2hex(random_bytes($length / 2));
    }

    function sendActivationEmail($email, $activation_code) {
        $subject = "Activate your account";
        $message = "Click the link to activate your account: ";
        $message .= "http://localhost:8080/activate.php?code=" . $activation_code;
        $headers = "From: camagru@42porto.com";
        mail($email, $subject, $message, $headers);
    }
