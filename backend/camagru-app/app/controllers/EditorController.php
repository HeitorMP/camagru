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
        $overlaysJson = $_POST['overlays'] ?? null;
        $overlays = $overlaysJson ? json_decode($overlaysJson, true) : null;
    
        // Validar entrada
        if (!$userId || !isset($_FILES['photo']) || !is_array($overlays) || empty($overlays)) {
            response('error', null, message('image.upload_failed'));
        }
    
        // Sanitizar nomes dos overlays
        $overlays = array_map('sanitizeText', $overlays);
    
        // Cria os diretórios
        $userDir = BASE_PATH . '/public/gallery/' . $userId;
        $originalDir = BASE_PATH . '/storage/originals/' . $userId; // Novo diretório
        if (!is_dir($userDir)) {
            mkdir($userDir, 0777, true);
        }
        if (!is_dir($originalDir)) {
            mkdir($originalDir, 0777, true);
        }
    
        $baseImagePath = $_FILES['photo']['tmp_name'];
        $filename = uniqid();
        $outputExt = 'png'; // Padrão
        $outputPath = "{$userDir}/{$filename}.png";
        $originalPath = "{$originalDir}/{$filename}.png"; // Novo caminho
    
        // Salvar a imagem original
        if (!move_uploaded_file($baseImagePath, $originalPath)) {
            response('error', null, message('image.upload_failed'));
        }
    
        // Carregar a imagem base para aplicar overlays
        $baseImage = imagecreatefrompng($originalPath);
        if (!$baseImage) {
            response('error', null, message('image.upload_failed'));
        }
    
        // Aplicar cada overlay
        foreach ($overlays as $overlayName) {
            $gifPath = BASE_PATH . "/config/overlays/{$overlayName}.gif";
            $pngPath = BASE_PATH . "/config/overlays/{$overlayName}.png";
    
            if (file_exists($gifPath)) {
                $outputExt = 'gif';
                $outputPath = "{$userDir}/{$filename}.gif";
                if (!overlay_gif_on_image($originalPath, $gifPath, $outputPath)) {
                    imagedestroy($baseImage);
                    response('error', null, message('image.upload_failed'));
                }
                $originalPath = $outputPath;
                $baseImage = imagecreatefromgif($outputPath);
            } elseif (file_exists($pngPath)) {
                if (!merge_images($originalPath, $pngPath, $outputPath)) {
                    imagedestroy($baseImage);
                    response('error', null, message('image.upload_failed'));
                }
                $originalPath = $outputPath;
                $baseImage = imagecreatefrompng($outputPath);
            } else {
                imagedestroy($baseImage);
                response('error', null, message('image.overlay_not_found'));
            }
        }
    
        // Liberar memória
        imagedestroy($baseImage);
    
        $user = new User();
        $ownerName = $user->getUsernameById($userId);
        if (!$ownerName) {
            response('error', null, message('image.upload_failed'));
        }
    
        $imagePath = "gallery/{$userId}/{$filename}.{$outputExt}";
        $originalImagePath = "storage/originals/{$userId}/{$filename}.png";
        $images = new Images();
        if ($images->addImage($userId, $ownerName, $imagePath, $originalImagePath, json_encode($overlays))) {
            response('success', '/gallery', message('image.upload_success'));
        } else {
            response('error', null, message('image.upload_failed'));
        }
    }

    public function getOriginalImage() {
        requireAuth();
    
        $userId = $_SESSION['user_id'];
        $imageId = $_GET['image_id'] ?? null;
    
        if (!$imageId) {
            response('error', null, 'Image ID not provided');
        }
    
        $images = new Images();
        $image = $images->getImageById($imageId);
    
        if (!$image || $image['user_id'] != $userId) {
            response('error', null, 'Image not found or unauthorized');
        }
    
        $originalPath = BASE_PATH . '/' . $image['original_image_path'];
        if (!file_exists($originalPath)) {
            response('error', null, 'Original image not found');
        }
    
        $mime = mime_content_type($originalPath);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($originalPath));
        readfile($originalPath);
        exit;
    }
    
    public function getGallery() {
        requireAuth();
    
        $userId = $_SESSION['user_id'];
        $images = new Images();
        $photos = $images->getImagesByUserId($userId);

        echo json_encode(['status' => 'success', 'photos' => $photos]);
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

    public function editPhoto() {
        requireAuth();
    
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            response('error', null, message('image.edit_failed'));
        }
    
        $userId = $_SESSION['user_id'];
        $imageId = $_POST['image_id'] ?? null;
        $overlaysJson = $_POST['overlays'] ?? null;
        $overlays = $overlaysJson ? json_decode($overlaysJson, true) : [];
    
        // Validar entrada
        if (!$userId || !$imageId) {
            response('error', null, message('image.edit_failed'));
        }
    
        // Sanitizar overlays
        $overlays = array_map('sanitizeText', $overlays);
    
        // Buscar a imagem no banco
        $images = new Images();
        $image = $images->getImageById($imageId);
        if (!$image || $image['user_id'] != $userId) {
            response('error', null, message('image.not_found'));
        }
    
        $originalPath = BASE_PATH . '/' . $image['original_image_path']; // Corrigido
        if (!file_exists($originalPath)) {
            response('error', null, message('image.original_not_found'));
        }
    
        // Criar novo arquivo de saída
        $userDir = BASE_PATH . '/public/gallery/' . $userId;
        if (!is_dir($userDir)) {
            mkdir($userDir, 0777, true);
        }
        $filename = uniqid();
        $outputExt = 'png';
        $outputPath = "{$userDir}/{$filename}.png";
    
        // Se não houver overlays, copiar a imagem original diretamente
        if (empty($overlays)) {
            if (!copy($originalPath, $outputPath)) {
                response('error', null, message('image.edit_failed'));
            }
        } else {
            // Carregar a imagem original
            $baseImage = imagecreatefrompng($originalPath);
            if (!$baseImage) {
                response('error', null, message('image.edit_failed'));
            }
    
            // Aplicar overlays
            foreach ($overlays as $overlayName) {
                $gifPath = BASE_PATH . "/config/overlays/{$overlayName}.gif";
                $pngPath = BASE_PATH . "/config/overlays/{$overlayName}.png";
    
                if (file_exists($gifPath)) {
                    $outputExt = 'gif';
                    $outputPath = "{$userDir}/{$filename}.gif";
                    if (!overlay_gif_on_image($originalPath, $gifPath, $outputPath)) {
                        imagedestroy($baseImage);
                        response('error', null, message('image.edit_failed'));
                    }
                    $originalPath = $outputPath;
                    $baseImage = imagecreatefromgif($outputPath);
                } elseif (file_exists($pngPath)) {
                    if (!merge_images($originalPath, $pngPath, $outputPath)) {
                        imagedestroy($baseImage);
                        response('error', null, message('image.edit_failed'));
                    }
                    $originalPath = $outputPath;
                    $baseImage = imagecreatefrompng($outputPath);
                } else {
                    imagedestroy($baseImage);
                    response('error', null, message('image.overlay_not_found'));
                }
            }
    
            imagedestroy($baseImage);
        }
    
        // Remover a imagem pública antiga
        $oldImagePath = BASE_PATH . '/public/' . $image['image_path'];
        if (file_exists($oldImagePath)) {
            unlink($oldImagePath);
        }
    
        // Atualizar o banco
        $imagePath = "gallery/{$userId}/{$filename}.{$outputExt}";
        if ($images->updateImage($imageId, $imagePath, json_encode($overlays))) {
            response('success', '/gallery', message('image.edit_success'));
        } else {
            response('error', null, message('image.edit_failed'));
        }
    }
}