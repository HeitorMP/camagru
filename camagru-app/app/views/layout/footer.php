</main>
  <footer>
    <p>&copy; 2025 Camagru</p>
  </footer>
  <?php
    $page = $_GET['page'] ?? '';
    if ($page === 'register') {
        echo '<script src="/assets/js/register.js"></script>';
    }
  ?>
</body>
</html>


