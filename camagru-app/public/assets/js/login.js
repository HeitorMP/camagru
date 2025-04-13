document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const flashDiv = document.getElementById('flashMessageLogin');
  
    form.addEventListener('submit', function (e) {
      const password = form.password.value;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
  
      let message = "";
      let type = "error";
  
      if (!passwordRegex.test(password)) {
        message = "Password must be 8-16 characters, contain at least one uppercase, one lowercase letter, and a number.";
      }

      if (message !== "") {
        e.preventDefault();
        flashDiv.textContent = message;
        flashDiv.className = ""; // clear previous classes
        flashDiv.classList.add("flash", type); // e.g., "flash error"
      }
    });
  });