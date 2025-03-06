document.addEventListener("DOMContentLoaded", () => {
  const otpInputs = document.querySelectorAll(".otp-input");
  const otpForm = document.getElementById("otpForm");
  const resendBtn = document.getElementById("resendBtn");
  const countdownEl = document.getElementById("countdown");
  let timeLeft = 120; // 2 minutes

  // Handle OTP input
  otpInputs.forEach((input, index) => {
    input.addEventListener("keyup", (e) => {
      if (e.key >= 0 && e.key <= 9) {
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      } else if (e.key === "Backspace") {
        if (index > 0) {
          otpInputs[index - 1].focus();
        }
      }
    });
  });

  // Update countdown timer
  function updateCountdown() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    countdownEl.textContent = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

    if (timeLeft === 0) {
      resendBtn.disabled = false;
      return;
    }

    timeLeft--;
    setTimeout(updateCountdown, 1000);
  }

  updateCountdown();

  // Handle form submission
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Account verified successfully!", "success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showToast(data.message || "Invalid OTP", "error");
      }
    } catch (error) {
      showToast("An error occurred. Please try again.", "error");
    }
  });

  // Handle resend OTP
  resendBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        timeLeft = 120;
        resendBtn.disabled = true;
        updateCountdown();
        showToast("OTP resent successfully!", "success");
      } else {
        showToast(data.message || "Failed to resend OTP", "error");
      }
    } catch (error) {
      showToast("An error occurred. Please try again.", "error");
    }
  });

  function showToast(message, type) {
    // Remove existing toasts
    document.querySelectorAll(".toast").forEach((t) => t.remove());

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
