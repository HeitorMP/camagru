<h2>Login</h2>
<form id="loginForm" method="post" action="index.php?page=login_submit">
    <label>Username or Email:<br>
        <input type="text" name="login" required>
    </label><br><br>
    <label>Password:<br>
        <input type="password" name="password" required>
    </label><br><br>
    <button type="submit">Login</button>
</form>

<p>Don't have an account yet? <a href="index.php?page=register">Register here</a></p>

<?php $flash = getFlash(); ?>
<div id="flashMessageLogin" class="flash <?= $flash ? $flash['type'] : '' ?>">
    <?php if ($flash): ?>
        <?= htmlspecialchars($flash['message']) ?>
    <?php endif; ?>
</div>