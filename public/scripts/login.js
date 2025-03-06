document.addEventListener("DOMContentLoaded", () => {
  // Add animated background elements
  const bgLayer2 = document.querySelector(".bg-layer-2");
  const symbols = "";
  const elements = symbols.split(" ");

  function updateBackground() {
    const newElements = elements.sort(() => Math.random() - 0.5).join(" ");
    bgLayer2.textContent = newElements + " " + newElements;
  }

  setInterval(updateBackground, 5000);

  // Tab switching
  const tabs = document.querySelectorAll(".tab");
  const forms = document.querySelectorAll(".form");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Show selected form
      forms.forEach((form) => {
        form.classList.remove("active");
        if (form.id === `${target}Form`) {
          form.classList.add("active");
        }
      });
    });
  });

  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const icon = themeToggle.querySelector("i");

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme === "dark");

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme === "dark");
  });

  function updateThemeIcon(isDark) {
    if (isDark) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  }

  // Fix password visibility toggle
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get the parent input-group and find the password input within it
      const inputGroup = button.closest(".input-group");
      const input = inputGroup.querySelector("input");

      // Toggle password visibility
      if (input.type === "password") {
        input.type = "text";
        button.classList.remove("fa-eye-slash");
        button.classList.add("fa-eye");
      } else {
        input.type = "password";
        button.classList.remove("fa-eye");
        button.classList.add("fa-eye-slash");
      }
    });
  });

  // Form submission
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Add your login logic here
  });

  // Remove signup form handler as it will submit directly to /signup

  // Form validation
  const validations = {
    name: {
      test: (value) => /^[A-Za-z\s]{3,}$/.test(value),
      message:
        "Name should be at least 3 characters long and contain only letters",
    },
    email: {
      test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address",
    },
    phone: {
      test: (value) => /^\d{10}$/.test(value),
      message: "Phone number should be 10 digits",
    },
    dob: {
      test: (value) => {
        const date = new Date(value);
        const age = (new Date() - date) / (365 * 24 * 60 * 60 * 1000);
        return age >= 13;
      },
      message: "You must be at least 13 years old",
    },
    password: {
      test: (value) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value),
      message:
        "Password must be at least 8 characters with letters and numbers",
    },
    confirmPassword: {
      test: (value) =>
        value === document.getElementById("signupPassword").value,
      message: "Passwords do not match",
    },
    loginEmail: {
      test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address",
    },
    loginPassword: {
      test: (value) => value.length >= 8,
      message: "Password must be at least 8 characters",
    },
  };

  function validateField(input, isLogin = false) {
    const validationType = isLogin
      ? "login" + input.name.charAt(0).toUpperCase() + input.name.slice(1)
      : input.dataset.validate;
    const errorElement = input.parentElement.querySelector(".error-message");
    const validation = validations[validationType];

    if (!validation) return true;
    if (!errorElement) {
      console.warn(`Error message element not found for ${input.name}`);
      return true;
    }

    const isValid = validation.test(input.value);
    if (errorElement) {
      errorElement.textContent = isValid ? "" : validation.message;
      errorElement.classList.toggle("show", !isValid);
      input.parentElement.classList.toggle("error", !isValid);
      input.parentElement.classList.toggle("success", isValid);
    }
    return isValid;
  }

  // Login form validation
  const loginInputs = loginForm.querySelectorAll("input");

  loginInputs.forEach((input) => {
    input.addEventListener("input", () => validateField(input, true));
    input.addEventListener("blur", () => validateField(input, true));
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let isValid = true;
    loginInputs.forEach((input) => {
      if (!validateField(input, true)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    try {
      const formData = new FormData(loginForm);
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
        credentials: "include", // Important for cookies
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message || "Login successful!", "success");
        setTimeout(() => {
          window.location.href = data.redirect || "/dashboard";
        }, 1000);
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  });

  // Signup form validation
  const signupForm = document.getElementById("signupForm");
  const signupInputs = signupForm.querySelectorAll("[data-validate]");

  signupInputs.forEach((input) => {
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let isValid = true;
    signupInputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    // Show loading toast
    const loadingToast = showToast(
      "Sending OTP, please wait...",
      "info",
      false
    );
    const submitBtn = signupForm.querySelector(".submit-btn");
    submitBtn.disabled = true;

    try {
      const formData = new FormData(signupForm);
      const data = Object.fromEntries(formData);

      const response = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      // Remove loading toast
      if (loadingToast) loadingToast.remove();

      if (response.ok) {
        showToast(
          responseData.message || "Account created successfully!",
          "success"
        );
        setTimeout(() => {
          window.location.href = responseData.redirect || "/verify-otp";
        }, 1000);
      } else {
        showToast(
          responseData.message || "Signup failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      // Remove loading toast
      if (loadingToast) loadingToast.remove();
      console.error("Signup error:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  function showToast(message, type, autoRemove = true) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Only remove existing toasts if this is not a loading message
    if (autoRemove) {
      document.querySelectorAll(".toast").forEach((t) => t.remove());
    }

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    if (autoRemove) {
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    return toast;
  }
});

// Add this after your existing event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Check if there's a logout button
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const response = await fetch("/logout", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => {
            window.location.href = data.redirect;
          }, 1000);
        }
      } catch (error) {
        console.error("Logout error:", error);
        showToast("Error during logout", "error");
      }
    });
  }
});

// Update the login form submission toast handling
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let isValid = true;
  loginInputs.forEach((input) => {
    if (!validateField(input, true)) {
      isValid = false;
    }
  });

  if (!isValid) {
    showToast("Please fix the errors before submitting", "error");
    return;
  }

  try {
    const formData = new FormData(loginForm);
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok && data.success) {
      AuthService.setAccessToken(data.accessToken);
      showToast(data.message || "Login successful!", "success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } else {
      showToast(data.message || "Login failed", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showToast("An error occurred. Please try again.", "error");
  }
});
