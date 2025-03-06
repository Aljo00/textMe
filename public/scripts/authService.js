class AuthService {
  static accessToken = null;

  static setAccessToken(token) {
    this.accessToken = token;
  }

  static getAccessToken() {
    return this.accessToken;
  }

  static async refreshAccessToken() {
    try {
      const response = await fetch("/refresh-token", {
        method: "POST",
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      this.setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      window.location.href = "/login";
      return null;
    }
  }

  static async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getAccessToken();
    if (!token) {
      await this.refreshAccessToken();
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });

    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.makeAuthenticatedRequest(url, options);
      }
    }

    return response;
  }
}

window.AuthService = AuthService;
