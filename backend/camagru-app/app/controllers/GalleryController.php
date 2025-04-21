<?php

require_once BASE_PATH . '/app/models/Images.php';
require_once BASE_PATH . '/app/models/User.php';
require_once BASE_PATH . '/app/models/Likes.php';
require_once BASE_PATH . '/app/helpers/redirect.php';
require_once BASE_PATH . '/app/helpers/messages.php';
require_once BASE_PATH . '/app/helpers/auth.php';

class GalleryController
{
    public function getGallery() {
        requireAuth();
    
        $userId = $_SESSION['user_id'];
        $images = new Images();
        $gallery = $images->getUserGallery($userId);

        // add likes count to each image
        foreach ($gallery as &$image) {
            $likes = new Likes();
            $likesCount = $likes->getLikesCount($image['id']);
            $image['likes_count'] = $likesCount;
        }

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

    public function getPublicProfile() {
        $username = filter_input(INPUT_GET, 'username', FILTER_SANITIZE_STRING);
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

    public function likeImage() {
        requireAuth();
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $image_id = $input['id'] ?? null;
        $user_id = $_SESSION['user_id'] ?? null;

        if (!$image_id || !$user_id) {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]);
            exit;
        }

        $likes = new Likes();
        if ($likes->likeImage($image_id, $user_id)) {
            echo json_encode(['status' => 'success', 'message' => message('likes.liked')]);
            exit;
        } else {
            echo json_encode(['status' => 'error', 'message' => message('likes.already_liked')]);
            exit;
        }
    }

    public function dislikeImage() {
        requireAuth();
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $image_id = $input['id'] ?? null;
        $user_id = $_SESSION['user_id'] ?? null;

        if (!$image_id || !$user_id) {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]); 
            exit;
        }

        $likes = new Likes();
        if ($likes->dislikeImage($image_id, $user_id)) {
            echo json_encode(['status' => 'success', 'message' => message('likes.unliked')]);
            exit;
        } else {
            echo json_encode(['status' => 'error', 'message' => message('likes.not_liked')]);
            exit;
        }
    }

    public function getLikesCount() {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $image_id = $input['image_id'] ?? null;

        if (!$image_id) {
            echo json_encode(['status' => 'error', 'message' => message('likes.invalid_request')]);
            exit;
        }

        $likes = new Likes();
        $count = $likes->getLikesCount($image_id);
        echo json_encode(['status' => 'success', 'count' => $count]);
        exit;
    }
}
