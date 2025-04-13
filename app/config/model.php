<?php

class DB_USER {
    // (A) CONNECT TO DATABASE
    private $error = "";
    private $pdo = null;
    private $stmt = null;
    function __construct () {
        $this->pdo = new PDO("mysql:host=db;dbname=camagru", "root", "root123");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }

    // (B) DISCONNECT FROM DATABASE
    function __destruct () {
        if ($this->stmt) { $this->stmt = null; }
        if ($this->pdo) { $this->pdo = null; }
    }

    // (C) GET ERROR MESSAGE
    function getError () {
        return $this->error;
    }

    // (D) CREATE USER
    function createUser ($username, $email, $password) {
        $this->stmt = $this->pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        if ($this->stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT)])) {
            return true;
        } else {
            $this->error = "Error creating user.";
            return false;
        }
    }

    // (E) GET USER BY ID
    function getUserById ($id) {
        $this->stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $this->stmt->execute([$id]);
        return $this->stmt->fetch();
    }

    

}