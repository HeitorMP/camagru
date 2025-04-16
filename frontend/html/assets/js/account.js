
// <form id="updateUsername">
//     <label>Username:<br>
//         <input type="text" id="username" required>
//     </label>
// </form>
// <button id="updateUsernameButton">Update Username</button>
// <form id="updateEmail">
//     <label>Email:<br>
//         <input type="email" id="email" required>
//     </label>
// </form>
// <button id="updateEmailButton">Update Email</button>
// <form id="updatePassword">
//     <label>Password:<br>
//         <input type="password" id="password" required>
//     </label>
//     <label>Confirm Password:<br>
//         <input type="password" id="confirmPassword" required>
//     </label>
// </form>
// <button id="updatePasswordButton">Update Password</button>

// <div id="flashMessage" class="flash"></div>

export function init() {
    const flash = document.getElementById('flashMessage');

    document.getElementById('updateUsernameButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();

        try {
            const response = await fetch('/api/?page=update_username', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                flash.textContent = data.message || 'Username updated successfully.';
                flash.style.color = 'green';
            } else {
                flash.textContent = data.message || 'Error updating username.';
                flash.style.color = 'red';
            }
        } catch (error) {
            console.error('Network error:', error);
            flash.textContent = 'Network error. Please try again later.';
            flash.style.color = 'red';
        }
        
    });

    document.getElementById('updateEmailButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        await updateAccountInfo('email', email);
    });

    document.getElementById('updatePasswordButton').addEventListener('click', async function (e) {
        e.preventDefault();
        const password = document.getElementById('password').value.trim();
        const confirm_password = document.getElementById('confirmPassword').value.trim();
        await updateAccountInfo('password', { password, confirm_password });
    });
}