<?php

require_once BASE_PATH . '/app/models/Images.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/merge_image.php';

class ImageController {
   
    public function uploadImage() {
        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            response('error', null, message('image.upload_failed'));
        }
        $userId = $_SESSION['user_id'];
        $overlayName = $_POST['overlay'];

        if (!$userId || !isset($_FILES['photo']) || !$overlayName) {
            response('error', null, message('image.upload_failed'));
        }
        
        // create the upload directory if it doesn't exist
        if (!is_dir(BASE_PATH . '/public/gallery/' . $userId)) {
            mkdir(BASE_PATH . '/public/gallery/' . $userId, 0777, true);
        }
        

        $filename = uniqid() . '.png';
        $targetFile =  BASE_PATH . '/public/gallery/' . $userId . '/' . $filename;
        
        // merge the image with the overlay
        $baseImagePath = $_FILES['photo']['tmp_name'];
        $overlayPath = BASE_PATH . '/config/overlays/' . $overlayName . ".png";

        $outputPath = $targetFile;
        if (!file_exists($overlayPath)) {
            response('error', null, message('image.overlay_not_found'));
            exit;
        }
        if (!merge_images($baseImagePath, $overlayName, $outputPath)) {
            response('error', null, message('image.upload_failed'));
            exit;
        }

        $imagePath = 'gallery/' . $userId . "/" . $filename;
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
    
        echo json_encode(['status' => 'success', 'photos' => $gallery]); 
    }

    public function deleteImage() {
        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] != 'DELETE') {
            response('error', null, message('image.delete_failed'));    
        }
        //get image name from body input
        $input = json_decode(file_get_contents("php://input"), true);
        $imageName = $input['filename'] ?? null;
        $userId = $_SESSION['user_id'];

        if (!$userId || !$imageName) {
            response('error', null, message('image.delete_failed'));
        }

        
        $images = new Images();

        $imageId = $images->getImageIdbyName($userId, $imageName);
        $imagePath = BASE_PATH . '/public/gallery/' . $userId . '/' . $imageName;


        //delete the real file of image
        if (file_exists($imagePath)) {
            unlink($imagePath);
        } else {
            response('error', null, message('image.delete_failed'));
        }
    
        if ($images->deleteImage($imageId)) {
            response('success', null, message('image.delete_success'));
        } else {
            response('error', null, message('image.delete_failed'));
        }
    }

    public function getImage() {
        requireAuth();

        if ($_SERVER['REQUEST_METHOD'] != 'GET') {
            response('error', null, message('image.get_failed'));
        }
        $userId = $_SESSION['user_id'];
        $imageId = $_GET['id'] ?? null;

        if (!$userId || !$imageId) {
            response('error', null, message('image.get_failed'));
        }

        $images = new Images();
        $image = $images->getImage($imageId);

        if ($image) {
            echo json_encode(['status' => 'success', 'photo' => $image]); 
        } else {
            response('error', null, message('image.get_failed'));
        }
    }
}