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

    if (validation) {
      const isValid = validation.test(input.value);
      errorElement.textContent = validation.message;
      errorElement.classList.toggle("show", !isValid);
      input.parentElement.classList.toggle("error", !isValid);
      input.parentElement.classList.toggle("success", isValid);
      return isValid;
    }
    return true;
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
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Login successful!", "success");
        window.location.href = "/dashboard";
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch (error) {
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

      if (response.ok) {
        showToast(
          responseData.message || "Account created successfully!",
          "success"
        );
        // Add slight delay before redirect
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
      console.error("Signup error:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  });

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Remove existing toasts
    document.querySelectorAll(".toast").forEach((t) => t.remove());

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/dashboard";
    } else {
      const errorDiv = document.querySelector(".error-message");
      errorDiv.textContent = result.message;
      errorDiv.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
    const errorDiv = document.querySelector(".error-message");
    errorDiv.textContent = "An error occurred. Please try again.";
    errorDiv.style.display = "block";
  }
});
