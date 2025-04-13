<h2>Login</h2>

<?php if (isset($_GET['error']) && $_GET['error'] === 'invalid'): ?>
  <p style="color:red;">Invalid username or password.</p>
<?php endif; ?>

<form method="post" action="index.php?page=login_submit">
    <label>Username or Email:<br>
        <input type="text" name="login" required>
    </label><br><br>

    <label>Password:<br>
        <input type="password" name="password" required>
    </label><br><br>

    <button type="submit">Login</button>
</form>

<p>Don't have an account yet? <a href="index.php?page=register">Register here</a></p>
