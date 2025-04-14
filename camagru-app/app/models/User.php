<?php
require_once BASE_PATH . '/config/database.php';

class User extends DB {

    private $id;
    private $verified = false;

    public function checkUsernameAvailability($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->rowCount() === 0;
    }

    public function checkEmailAvailability($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->rowCount() === 0;
    }

    public function create($username, $email, $password, $activation_code) {
        $stmt = $this->pdo->prepare("INSERT INTO users (username, email, password, activation_code) VALUES (?, ?, ?, ?)");
        try {
            $stmt->execute([
                $username,
                $email,
                password_hash($password, PASSWORD_DEFAULT),
                password_hash($activation_code, PASSWORD_DEFAULT),
            ]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function login($username, $password) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $this->id = $user['id'];
            $this->verified = $user['is_verified'];
            return true;
        }
        return false;
    }

    public function getId() {
        return $this->id;
    }

    public function getVerified() {
        return $this->verified;
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getByUsername($username) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function updateUsername($id, $username) {
        $stmt = $this->pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
        try {
            $stmt->execute([$username, $id]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function updateEmail($id, $email) {
        $stmt = $this->pdo->prepare("UPDATE users SET email = ? WHERE id = ?");
        try {
            $stmt->execute([$email, $id]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function updatePassword($id, $password) {
        $stmt = $this->pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        try {
            $stmt->execute([password_hash($password, PASSWORD_DEFAULT), $id]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function updateVerified($id, $verified) {
        $stmt = $this->pdo->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        try {
            $stmt->execute([$verified, $id]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }

    public function getUserIdByActivationCode($activation_code) {
        $stmt = $this->pdo->prepare("SELECT id, activation_code FROM users WHERE is_verified = 0");
        $stmt->execute();
        $users = $stmt->fetchAll();
    
        foreach ($users as $user) {
            if (password_verify($activation_code, $user['activation_code'])) {
                return $user['id'];
            }
        }
        return false;
    }
    
    public function deleteUser($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        try {
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            return false;
        }
        return true;
    }
}
