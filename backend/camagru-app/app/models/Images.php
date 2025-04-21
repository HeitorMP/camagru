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

    public function getImageIdbyName($userId, $imageName) {
        $imageName = 'gallery/' . $userId . "/" . $imageName;
        $stmt = $this->pdo->prepare("SELECT id FROM images WHERE image_path = ?");
        $stmt->execute([$imageName]);
        return $stmt->fetchColumn();
    }

    public function deleteImage($imageId) {
        $stmt = $this->pdo->prepare("DELETE FROM images WHERE id = ?");
        try {
            $stmt->execute([$imageId]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function isImageOwner($userId, $imageId) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM images WHERE id = ? AND user_id = ?");
        $stmt->execute([$imageId, $userId]);
        return $stmt->fetchColumn() > 0;
    }

    public function getImage($imageId) {
        $stmt = $this->pdo->prepare("SELECT * FROM images WHERE id = ?");
        $stmt->execute([$imageId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateLikes($imageId, $likes) {
        $stmt = $this->pdo->prepare("UPDATE images SET likes = ? WHERE id = ?");
        try {
            $stmt->execute([$likes, $imageId]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }
}
