
<form action="../includes/register.php" method="POST">
    <h1>Register</h1>
    <div>
        <label for="username">Username:</label>
        <input type="text" name="username" id="username">
    </div>
    <div>
        <label for="email">Email:</label>
        <input type="email" name="email" id="email">
    <div>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password">
    </div>
    <div>
        <label for="confirm_password">Confirm Password:</label>
        <input type="password" name="confirm_password" id="confirm_password">
    </div>
    <section>
        <button type="submit">Register</button>
        <a href="login.php">Login</a>
    </section>
</form>
