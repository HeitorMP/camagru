<?php
$page = $_GET['page'] ?? 'login';

include 'includes/header.php';

switch ($page) {
    case 'login':
        include 'pages/login.php';
        break;
    case 'register':
        include 'pages/register.php';
        break;
    case 'gallery':
        include 'pages/gallery.php';
        break;
    case 'editor':
        include 'pages/editor.php';
        break;
    default:
        include 'pages/home.php';
        break;
}

include 'includes/footer.php';
?>