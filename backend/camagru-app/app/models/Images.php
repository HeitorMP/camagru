<?php

require_once BASE_PATH . '/config/database.php';

class Images extends DB {

    public function getUserGallery($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getImageById($imageId) {
        $stmt = $this->pdo->prepare("SELECT * FROM images WHERE id = ?");
        $stmt->execute([$imageId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function addImage($userId, $imagePath) {
        $stmt = $this->pdo->prepare("INSERT INTO images (user_id, image_path) VALUES (?, ?)");
        try {
            $stmt->execute([$userId, $imagePath]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }
}
