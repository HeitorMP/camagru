<?php

    function generateActivationCode($length = 16) {
        return bin2hex(random_bytes($length / 2));
    }

    
    function generateRandomPassword($length = 16) {
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $numbers = '0123456789';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $uppercase[rand(0, strlen($uppercase) - 1)];
            $password .= $lowercase[rand(0, strlen($lowercase) - 1)];
            $password .= $numbers[rand(0, strlen($numbers) - 1)];
        }
        
        return substr(str_shuffle($password), 0, $length);
    }
    
    function sendActivationEmail($email, $activation_code) {
        $subject = "Activate your account";
    
        $message = "
            <html>
            <head><title>Activate your account</title></head>
            <body>
                <p>Click the link to activate your account:</p>
                <p><a href='http://localhost:8080/activate?email=$email&code=$activation_code'>Activate Account</a></p>
            </body>
            </html>
        ";
    
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: camagru@42porto.com\r\n";
    
        mail($email, $subject, $message, $headers);
    }

    function sendResetPassword($email, $new_pass)  {
        $subject = "Your new password";
        $message = "This is yout new password, change soon as possible: ";
        $message .= "password: " . $new_pass;
        $headers = "From: camagru@42porto.com";
        mail($email, $subject, $message, $headers);
    }