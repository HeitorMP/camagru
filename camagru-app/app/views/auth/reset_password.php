<h2>Reset password?</h2>
<!-- click to reset -->
<p>Enter your email address to reset your password.</p>
<form id="resetPasswordForm" method="post" action="index.php?page=reset_password_submit">
    <label>Email:<br>
        <input type="email" name="email" required>
    </label><br><br>
    <button type="submit">Reset Password</button>
</form>

<?php $flash = getFlash(); ?>
<div id="flashMessageRegister" class="flash <?= $flash ? $flash['type'] : '' ?>">
    <?php if ($flash): ?>
        <?= htmlspecialchars($flash['message']) ?>
    <?php endif; ?>
</div>