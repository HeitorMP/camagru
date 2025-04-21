<?php

require_once BASE_PATH . '/app/models/Images.php';
require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';

class GalleryController
{
    public function getGallery() {
        requireAuth();
    
        $userId = $_SESSION['user_id'];
        $images = new Images();
        $gallery = $images->getUserGallery($userId);
    
        echo json_encode(['status' => 'success', 'photos' => $gallery]); 
    }

    public function getGalleryByUsername()
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            response('error', null, message('gallery.user_not_found'));
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? null;
        if (!$username) {
            response('error', null, message('gallery.user_not_found'));
            exit;
        }

        $user = new User();
        $userId = $user->getIdByUsername($username);
        if (!$userId) {
            response('error', null, message('gallery.user_not_found'));
            exit;
        }

        $images = new Images();
        $gallery = $images->getUserGallery($userId);

        if ($gallery) {
            echo json_encode(['status' => 'success', 'photos' => $gallery]); 
        } else {
            response('error', null, message('gallery.no_images'));
        }
    }
}