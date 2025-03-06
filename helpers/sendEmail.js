const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const mongoose = require("mongoose");


const emailVerification = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"TextMe Security" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Verify Your TextMe Account",
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f9fafb;
              }
              .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(114, 105, 239, 0.1);
              }
              .email-header {
                background: linear-gradient(135deg, #7269ef, #9a94ff);
                padding: 30px 20px;
                text-align: center;
                color: white;
                position: relative;
              }
              .logo-container {
                background: white;
                width: 60px;  /* Reduced from 80px */
                height: 60px; /* Reduced from 80px */
                margin: 0 auto 15px;
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .logo {
                width: 100%;
                height: 100%;
                object-fit: contain; /* Ensures the logo fits properly */
                border-radius: 8px;
              }
              .welcome-text {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
                letter-spacing: -0.5px;
              }
              .email-content {
                padding: 40px 32px;
                background: white;
              }
              .otp-card {
                background: linear-gradient(145deg, #ffffff, #f8f9fa);
                border: 1px solid rgba(114, 105, 239, 0.1);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                margin: 24px 0;
                box-shadow: 0 4px 20px rgba(114, 105, 239, 0.08);
              }
              .otp-title {
                color: #7269ef;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
              }
              .otp-digits {
                font-size: 40px;
                font-weight: 700;
                letter-spacing: 12px;
                padding: 20px 30px;
                background: linear-gradient(135deg, #7269ef 0%, #9a94ff 100%);
                color: white;
                border-radius: 12px;
                margin: 20px 0;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(114, 105, 239, 0.2);
              }
              .timer-text {
                color: #dc3545;
                font-size: 14px;
                font-weight: 500;
                margin-top: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              .step-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 32px 0;
                text-align: left;
              }
              .step-item {
                padding: 16px;
                background: #f8f9fa;
                border-radius: 12px;
                border: 1px solid rgba(114, 105, 239, 0.1);
              }
              .step-number {
                color: #7269ef;
                font-weight: 600;
                margin-bottom: 8px;
                font-size: 14px;
              }
              .step-text {
                color: #495057;
                font-size: 13px;
                line-height: 1.5;
              }
              .features-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin: 32px 0;
              }
              .feature-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
              }
              .feature-icon {
                font-size: 24px;
                margin-bottom: 8px;
              }
              .feature-title {
                color: #495057;
                font-weight: 600;
                font-size: 14px;
                margin: 8px 0;
              }
              .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, rgba(114, 105, 239, 0.1), transparent);
                margin: 32px 0;
              }
              .footer {
                text-align: center;
                padding: 32px;
                background: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .social-links {
                display: flex;
                justify-content: center;
                gap: 16px;
                margin: 20px 0;
              }
              .social-link {
                color: #7269ef;
                text-decoration: none;
              }
              .warning-text {
                color: #6c757d;
                font-size: 13px;
                margin-top: 16px;
                padding: 12px;
                background: #fff8f8;
                border-left: 4px solid #dc3545;
                border-radius: 4px;
              }
              .security-notice {
                margin-top: 32px;
                padding: 16px;
                background: #fff8f8;
                border-left: 4px solid #dc3545;
                border-radius: 4px;
                font-size: 13px;
                color: #dc3545;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <div class="logo-container">
                  <img src="cid:logo" class="logo" alt="TextMe Logo">
                </div>
                <h1 class="welcome-text">Verify Your Account</h1>
                <p style="margin: 8px 0 0">Welcome to TextMe! Let's get you started</p>
              </div>
              
              <div class="email-content">
                <p style="font-size: 16px; color: #495057; margin-bottom: 24px;">
                  Hi there! 👋<br>
                  Thank you for choosing TextMe. To ensure your security, please verify your account using the verification code below.
                </p>

                <div class="otp-card">
                  <div class="otp-title">Your Verification Code</div>
                  <div class="otp-digits">${otp}</div>
                  <div class="timer-text">
                    ⏰ This code will expire in 2 minutes
                  </div>
                </div>

                <div class="step-grid">
                  <div class="step-item">
                    <div class="step-number">Step 1</div>
                    <div class="step-text">Copy the verification code shown above</div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">Step 2</div>
                    <div class="step-text">Enter the code in the verification window</div>
                  </div>
                  <div class="step-item">
                    <div class="step-number">Step 3</div>
                    <div class="step-text">Start enjoying TextMe's features</div>
                  </div>
                </div>

                <div class="features-grid">
                  <div class="feature-card">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">Instant Messaging</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Secure Chats</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">🌐</div>
                    <div class="feature-title">Cross-Platform</div>
                  </div>
                  <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Mobile Friendly</div>
                  </div>
                </div>

                <div class="security-notice">
                  <strong>Security Notice:</strong><br>
                  • Never share this code with anyone<br>
                  • TextMe will never ask for this code via email or phone<br>
                  • Code expires in 2 minutes for your security
                </div>
              </div>

              <div class="footer">
                <div class="social-links">
                  <a href="#" class="social-link">Twitter</a>
                  <a href="#" class="social-link">Facebook</a>
                  <a href="#" class="social-link">Instagram</a>
                </div>
                <p>© ${new Date().getFullYear()} TextMe. All rights reserved.</p>
                <p style="margin-top: 8px; font-size: 12px;">
                  Need help? Contact our support team at <a href="mailto:support@textme.com" style="color: #7269ef;">support@textme.com</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      attachments: [
        {
          filename: "logo.jpg",
          path: "public/assets/logo.jpg",
          cid: "logo",
        },
      ],
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.log("Email was not sent: ", error.message);
    return false;
  }
};

module.exports = emailVerification;