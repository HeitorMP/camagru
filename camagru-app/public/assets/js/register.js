document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const flashDiv = document.getElementById('flashMessageRegister');
  
    form.addEventListener('submit', function (e) {
      const username = form.username.value.toLowerCase();
      const password = form.password.value;
      const confirm = form.confirm_password.value;
  
      const usernameRegex = /^[A-Za-z][A-Za-z\d]{7}$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
  
      let message = "";
      let type = "error";
  
      if (!usernameRegex.test(username)) {
        message = "Username must start with a letter and be at least 8 characters long.";
      } else if (!passwordRegex.test(password)) {
        message = "Password must be 8-16 characters, contain at least one uppercase, one lowercase letter, and a number.";
      } else if (password !== confirm) {
        message = "Passwords do not match.";
      }
  
      if (message !== "") {
        e.preventDefault();
        flashDiv.textContent = message;
        flashDiv.className = ""; // clear previous classes
        flashDiv.classList.add("flash", type); // e.g., "flash error"        
      }
    });
  });
  