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

    public function getImagesByUserId($userId) {
        $stmt = $this->pdo->prepare("
            SELECT id, user_id, owner_name, image_path, original_image_path, overlays
            FROM images
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addImage($userId, $ownerName, $imagePath, $originalImagePath, $overlays) {
        // $stmt = $this->pdo->prepare("INSERT INTO images (user_id, owner_name, image_path) VALUES (?, ?, ?)");
        $stmt = $this->pdo->prepare("
            INSERT INTO images (user_id, owner_name, image_path, original_image_path, overlays)
            VALUES (?, ?, ?, ?, ?)
        ");
        return $stmt->execute([$userId, $ownerName, $imagePath, $originalImagePath, $overlays]);
    }

    public function updateImage($imageId, $imagePath, $overlays) {
        $stmt = $this->pdo->prepare("
            UPDATE images
            SET image_path = ?, overlays = ?
            WHERE id = ?
        ");
        return $stmt->execute([$imagePath, $overlays, $imageId]);
    }

    public function getImageOwner($imageId) {
        $stmt = $this->pdo->prepare("SELECT owner_name FROM images WHERE id = ?");
        $stmt->execute([$imageId]);
        return $stmt->fetchColumn();
    }

    public function getAllImagesSortedByDate() {
        $stmt = $this->pdo->prepare("SELECT * FROM images ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
