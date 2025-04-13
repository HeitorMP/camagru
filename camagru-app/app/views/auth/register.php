<h2>Register</h2>

<?php if (isset($_GET['error']) && $_GET['error'] === 'not_match'): ?>
  <p style="color:red;">Passwords do not match.</p>
<?php endif; ?>

<?php if (isset($_GET['error']) && $_GET['error'] === 'failed'): ?>
  <p style="color:red;">Registration failed. Please try again.</p>
<?php endif; ?>

<form method="post" action="index.php?page=register_submit">
    <label>Username: <input type="text" name="username" required></label><br>
    <label>Email: <input type="email" name="email" required></label><br>
    <label>Password: <input type="password" name="password" required></label><br>
    <label>Confirm Password: <input type="password" name="confirm_password" required></label><br>
    <button type="submit">Register</button>
</form>

<p>Already have an account? <a href="index.php?page=login">Login here</a></p>
