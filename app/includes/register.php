<?php
    include_once '../config/model.php';

    if (isset($_POST['username']) && isset($_POST['email']) && isset($_POST['password']) && isset($_POST['confirm_password'])) {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];

        if ($password !== $confirm_password) {
            echo "Passwords do not match.";
            exit();
        }

        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Create a new user
        $db = new DB_USER();
        if ($db->createUser($username, $email, $hashed_password)) {
            echo "User registered successfully.";
            header("Location: ../index.php?page=login");
            exit();
        } else {
            echo "Error: " . $db->getError();
        }
    }