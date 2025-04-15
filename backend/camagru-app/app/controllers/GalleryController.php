<?php
    require_once BASE_PATH . '/app/models/User.php';
    require_once BASE_PATH . '/app/helpers/redirect.php';
    require_once BASE_PATH . '/app/helpers/messages.php';

    class GalleryController {
        public function showGallery() {
            // session_start();
            
            // Check if the user is verified
            redirectNoAccess('login');
            include BASE_PATH . '/app/views/layout/header.php';
            include BASE_PATH . '/app/views/gallery/gallery.php';
            include BASE_PATH . '/app/views/layout/footer.php';
        }
    }