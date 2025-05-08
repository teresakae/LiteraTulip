document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const addProductForm = document.getElementById("addProductForm");

  if (registerForm) {
    const passwordInputRegister = document.getElementById("password_regist");
    const togglePasswordRegister = document.getElementById(
      "togglePasswordRegister"
    );

    togglePasswordRegister.addEventListener("mousedown", () => {
      passwordInputRegister.type = "text";
    });

    togglePasswordRegister.addEventListener("mouseup", () => {
      passwordInputRegister.type = "password";
    });

    togglePasswordRegister.addEventListener("mouseleave", () => {
      if (document.activeElement === togglePasswordRegister) {
        passwordInputRegister.type = "password";
      }
    });

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username_regist").value;
      const password = document.getElementById("password_regist").value;

      console.log("Form submitted:", { username, password });

      try {
        const response = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
        if (response.ok) {
          showAlert("Registration successful!", "success");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        } else {
          const errorMsg = data.error || data.message || "Something went wrong";
          showAlert(`Registration failed: ${errorMsg}`, "danger");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        showAlert(`Error: ${error.message}`, "danger");
      }
    });
  }

  if (loginForm) {
    const passwordInput = document.getElementById("password_login");
    const togglePassword = document.getElementById("togglePasswordLogin");

    togglePassword.addEventListener("mousedown", () => {
      passwordInput.type = "text";
    });

    togglePassword.addEventListener("mouseup", () => {
      passwordInput.type = "password";
    });

    togglePassword.addEventListener("mouseleave", () => {
      if (document.activeElement === togglePassword) {
        passwordInput.type = "password";
      }
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username_login").value;
      const password = document.getElementById("password_login").value;

      try {
        const response = await fetch("http://localhost:3000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.message === "Login successful" && data.user) {
          showAlert(
            `Login successful! Welcome, ${data.user.username}`,
            "success"
          );
          setTimeout(() => {
            window.location.href = "home.html";
          }, 1500);
        } else {
          showAlert("Invalid credentials. Please try again.", "danger");
        }
      } catch (error) {
        showAlert(`Error: ${error.message}`, "danger");
      }
    });
  }

  if (adminLoginForm) {
    const passwordInputAdmin = document.getElementById("password_admin");
    const togglePasswordAdmin = document.getElementById("togglePasswordAdmin");

    togglePasswordAdmin.addEventListener("mousedown", function () {
      passwordInputAdmin.type = "text";
    });

    togglePasswordAdmin.addEventListener("mouseup", function () {
      passwordInputAdmin.type = "password";
    });

    togglePasswordAdmin.addEventListener("mouseleave", function () {
      if (document.activeElement === togglePasswordAdmin) {
        passwordInputAdmin.type = "password";
      }
    });

    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username_admin").value;
      const password = document.getElementById("password_admin").value;
      const errorMessage = document.getElementById("errorMessage");

      errorMessage.style.display = "none"; 

      try {
        const response = await fetch("http://localhost:3000/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.message === "Login successful" && data.admin) {
          showAlert(
            `Login successful! Welcome, ${data.admin.username}`,
            "success"
          );
          setTimeout(() => {
            window.location.href = "admin-dashboard.html";
          }, 1500);
        } else {
          showAlert("Invalid credentials. Please try again.", "danger");
        }
      } catch (error) {
        showAlert(`Error: ${error.message}`, "danger");
      }
    });
  }

  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const productName = document.getElementById("productName").value.trim();
      const productPrice = document.getElementById("productPrice").value;
      const productStock = document.getElementById("productStock").value;

      if (!productName || !productPrice || !productStock) {
        showAlert("All fields are required.", "danger");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nama: productName,
            harga: productPrice,
            stok: productStock,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          showAlert("Product added successfully!", "success");
          addProductForm.reset();
        } else {
          showAlert("Failed to add product: Product already exists.", "danger");
        }
      } catch (error) {
        console.error("Error:", error);
        showAlert(`Error: ${error.message}`, "danger");
      }
    });
  }

  function showAlert(message, type) {
    const alert = document.getElementById("alertMessage");
    alert.textContent = message;
    alert.className = `alert alert-${type} alert-custom`;
    alert.style.display = "block";
    setTimeout(() => {
      alert.style.display = "none";
    }, 5000);
  }
});
