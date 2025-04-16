<?php
    session_start();
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

    function response($status, $page = null, $message = null, $http_code = 200) {
        header('Content-Type: application/json');
        http_response_code($http_code);
        
        // redirect with message
        if ($page !== null && $message !== null) {
            $response = [
                'status' => $status,
                'redirect' => $page . "?message=" . $message . "&status=" . $status,
            ];
        }
        // redirect without message
        elseif ($page !== null) {
            $response = [
                'status' => $status,
                'redirect' => $page,
            ];
        }
        // only response
        elseif ($message !== null) {
            $response = [
                'status' => $status,
                'message' => $message,
            ];
        }
        // only status
        else {
            $response = [
                'status' => $status,
            ];
        }

        echo json_encode($response);
        exit();
    }
    


    

            
            