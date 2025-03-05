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
});
