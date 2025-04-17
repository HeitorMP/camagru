<?php

require_once BASE_PATH . '/app/models/Images.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';

class ImageController {
   
    public function uploadImage() {
        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            echo json_encode(['status' => 'error', null,'message' => 'Invalid request method.']);
            exit;
        }
        $userId = $_SESSION['user_id'];

        if (!$userId || !isset($_FILES['photo'])) {
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized or no photo uploaded.']);
            exit;
        }
        
        $uploadDir = BASE_PATH . '/public/uploads/';
        $filename = uniqid() . '.png';
        $targetFile = $uploadDir . $filename;
        
        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
            response('error', null, message('image.upload_failed'));
            exit;
        }
        
        $imagePath = '/uploads/' . $filename;
        $images = new Images();
        if ($images->addImage($userId, $imagePath)) {
            response('success', '/gallery', message('image.upload_success'));
        } else {
            response('error', null, message('image.upload_failed'));
        }
    }

    public function getGallery() {
        requireAuth();
    
        $userId = $_SESSION['user_id'];
        $images = new Images();
        $gallery = $images->getUserGallery($userId);
    
        response('success', null, $gallery);
    }
    
}