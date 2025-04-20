<?php

function read_secret($key, $default = null) {
    $secret_path = "/run/secrets/{$key}";
    if (file_exists($secret_path)) {
        return trim(file_get_contents($secret_path));
    }
    return $default;
}

class DB {
    protected $pdo;
    public function __construct() {
        $db_host = getenv('DB_HOST') ?: 'db';
        $db_port = getenv('DB_PORT') ?: '3306';
        $db_user = getenv('MYSQL_USER');
        $db_name = getenv('MYSQL_DATABASE');

        $db_password = read_secret('db_password');

        $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";

        try {
            $this->pdo = new PDO($dsn, $db_user, $db_password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            die("Connection error: " . $e->getMessage());
        }
    }
}

