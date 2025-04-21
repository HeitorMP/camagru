<?php
require_once BASE_PATH . '/config/database.php';

class Likes extends DB {


    public function likeImage($image_id, $user_id) {
        $stmt = $this->pdo->prepare("INSERT INTO likes (image_id, user_id) VALUES (?, ?)");
        try {
            $stmt->execute([$image_id, $user_id]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    public function dislikeImage($image_id, $user_id) {
        $stmt = $this->pdo->prepare("DELETE FROM likes WHERE image_id = ? AND user_id = ?");
        try {
            $stmt->execute([$image_id, $user_id]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    public function getLikesCount($image_id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM likes WHERE image_id = ?");
        $stmt->execute([$image_id]);
        return $stmt->fetchColumn();
    }
}