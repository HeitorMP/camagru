<h2>Edit profile</h2>
<form method="POST" action="index.php?page=edit_profile">
    <div class="form-group">
        <label for="username">Username</label>
        <input type="text" class="form-control" id="username" name="username" required>
    </div>
    <button type="submit" class="btn btn-primary">Update</button>
</form>
<!-- email update -->
<form method="POST" action="index.php?page=edit_profile">
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" required>
    </div>
    <button type="submit" class="btn btn-primary">Update</button>
</form>
<!-- password update -->
<form method="POST" action="index.php?page=edit_profile">
    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control" id="password" name="password" required>
    </div>
    <button type="submit" class="btn btn-primary">Update</button>
</form>
<!-- delete account -->
<form method="POST" action="index.php?page=edit_profile">
    <div class="form-group">
        <label for="delete_account">Delete Account</label>
        <input type="checkbox" class="form-control" id="delete_account" name="delete_account" required>
    </div>
    <button type="submit" class="btn btn-danger">Delete</button>
</form>

<?php $flash = getFlash(); ?>
<div id="flashMessageEditPoofile" class="flash <?= $flash ? $flash['type'] : '' ?>">
    <?php if ($flash): ?>
        <?= htmlspecialchars($flash['message']) ?>
    <?php endif; ?>
</div>