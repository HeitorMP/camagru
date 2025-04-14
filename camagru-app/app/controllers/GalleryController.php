<?php
    require_once BASE_PATH . '/app/models/User.php';

    class GalleryController {
        public function showGallery() {
            session_start();
            
            if (!isset($_SESSION['user_id'])) {
                header('Location: index.php?page=login');
                exit();
            }
            // Check if the user is verified
            if (!isset($_SESSION['user_verified']) || $_SESSION['user_verified'] !== 1) {
                header('Location: index.php?page=not_verified');
                exit();
            }

            include BASE_PATH . '/app/views/layout/header.php';
            include BASE_PATH . '/app/views/gallery/gallery.php';
            include BASE_PATH . '/app/views/layout/footer.php';
        }
    }