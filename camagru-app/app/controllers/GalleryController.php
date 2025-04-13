<?php
    require_once BASE_PATH . '/app/models/User.php';

    class GalleryController {
        public function showGallery() {
            include BASE_PATH . '/app/views/layout/header.php';
            include BASE_PATH . '/app/views/gallery/gallery.php';
            include BASE_PATH . '/app/views/layout/footer.php';
        }
    }