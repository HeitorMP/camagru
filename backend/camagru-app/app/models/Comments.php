<?php
require_once BASE_PATH . '/config/database.php';

class Comments extends DB {
    public function addComment($image_id, $user_id, $owner ,$comment) {
        $stmt = $this->pdo->prepare("INSERT INTO comments (image_id, user_id, owner_name ,content) VALUES (?, ?, ?, ?)");
        try {
            $stmt->execute([$image_id, $user_id, $owner, $comment]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
    public function deleteComment($comment_id) {
        $stmt = $this->pdo->prepare("DELETE FROM comments WHERE id = ?");
        try {
            $stmt->execute([$comment_id]);
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }

    public function getComments($image_id) {
        $stmt = $this->pdo->prepare("SELECT * FROM comments WHERE image_id = ?");
        try {
            $stmt->execute([$image_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
}