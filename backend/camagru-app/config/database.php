<?php
class DB {
    protected $pdo;
    public function __construct() {
        $db_host = getenv('DB_HOST');
        $db_port = getenv('DB_PORT');
        $db_user = getenv('MYSQL_USER');
        $db_password = getenv('MYSQL_PASSWORD');
        $db_name = getenv('MYSQL_DATABASE');
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
