<?php

require_once BASE_PATH . '/app/models/Images.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/merge_image.php';
require_once BASE_PATH . '/app/helpers/sanitizer.php';

class ImageController {
   
    public function uploadImage() {
        requireAuth();
    
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            response('error', null, message('image.upload_failed'));
        }
    
        $userId = $_SESSION['user_id'];
        $overlayName = $_POST['overlay'] ?? null;

        $overlayName = sanitizeText($overlayName);
    
        if (!$userId || !isset($_FILES['photo']) || !$overlayName) {
            response('error', null, message('image.upload_failed'));
        }
    
        // Cria o diretório do usuário, se não existir
        $userDir = BASE_PATH . '/public/gallery/' . $userId;
        if (!is_dir($userDir)) {
            mkdir($userDir, 0777, true);
        }
    
        $baseImagePath = $_FILES['photo']['tmp_name'];
        $outputExt = 'png'; // padrão
        $filename = uniqid();
        $outputPath = ''; // definido depois
    
        // Verifica qual tipo de overlay existe (gif ou png)
        $gifPath = BASE_PATH . "/config/overlays/{$overlayName}.gif";
        $pngPath = BASE_PATH . "/config/overlays/{$overlayName}.png";

        
        if (file_exists($gifPath)) {
            $outputExt = 'gif';
            $outputPath = "{$userDir}/{$filename}.gif";
            
            if (!overlay_gif_on_image($baseImagePath, $gifPath, $outputPath)) {
                echo json_encode(['status' => 'error', 'error' => 'aqui']);
                response('error', null, message('image.upload_failed'));
            }
        } elseif (file_exists($pngPath)) {
            $outputExt = 'png';
            $outputPath = "{$userDir}/{$filename}.png";
            
            if (!merge_images($baseImagePath, $pngPath, $outputPath)) {
                response('error', null, message('image.upload_failed'));
            }
        } else {
            response('error', null, message('image.overlay_not_found'));
        }
    
        $user = new User();
        $ownerName = $user->getUsernameById($userId);
        if (!$ownerName) {
            response('error', null, message('image.upload_failed'));
        }
    
        $imagePath = "gallery/{$userId}/{$filename}.{$outputExt}";
        $images = new Images();
        if ($images->addImage($userId, $ownerName, $imagePath)) {
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

        $input = json_decode(file_get_contents("php://input"), true);
        $imageName = $input['filename'] ?? null;
        $userId = $_SESSION['user_id'];

        $imageName = sanitizeText($imageName);
        
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

        if ($_SERVER['REQUEST_METHOD'] != 'GET') {
            response('error', null, message('image.get_failed'));
        }

        $imageId = $_GET['id'] ?? null;

        if (!$imageId) {
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