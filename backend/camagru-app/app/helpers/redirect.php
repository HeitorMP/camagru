<?php    
    function response($status, $page = null, $message = null, $http_code = 200) {
        header('Content-Type: application/json');
        http_response_code($http_code);
    
        if ($page !== null && $message !== null) {

            $response = [
                'status' => $status,
                'redirect' => $page,
                'message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8') // escaped messge
            ];
        }

        elseif ($page !== null) {
            $response = [
                'status' => $status,
                'redirect' => $page
            ];
        }
        // Só mensagem
        elseif ($message !== null) {
            $response = [
                'status' => $status,
                'message' => $message
            ];
        }
        // Só status
        else {
            $response = [
                'status' => $status
            ];
        }
    
        echo json_encode($response);
        exit();
    }
    
    


    

            
            