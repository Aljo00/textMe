document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Initialize notification system
  if (window.currentUserId) {
    socket.emit("join_user_room", window.currentUserId);
  }

  // Listen for friend requests globally
  socket.on("new_friend_request", ({ toUserId, fromUser, count }) => {
    // Only update notification if the current user is the recipient
    if (window.currentUserId === toUserId) {
      updateNotificationBadge(count);
      showToast(`New friend request from ${fromUser.name}`);

      // Update list if on friend requests page
      if (listHeader && listHeader.textContent === "Friend Requests") {
        fetchAndRenderContent("/api/friend-requests");
      }
    }
  });

  function updateNotificationBadge(count) {
    const badge = document.querySelector(".notification-badge");
    if (!badge) return;

    if (count > 0) {
      badge.style.display = "flex";
      badge.textContent = count;
      // Store count in localStorage for persistence
      localStorage.setItem("pendingRequestsCount", count);
    } else {
      badge.style.display = "none";
      localStorage.removeItem("pendingRequestsCount");
    }
  }

  // Load stored notification count on page load
  const storedCount = localStorage.getItem("pendingRequestsCount");
  if (storedCount) {
    updateNotificationBadge(parseInt(storedCount));
  }

  // Fetch initial request count
  fetch("/api/friend-requests")
    .then((res) => res.json())
    .then((data) => {
      if (data.count > 0) {
        updateNotificationBadge(data.count);
      }
    });

  // Initialize friend request notifications
  const friendRequestIcon = document.querySelector(
    '[data-tooltip="Friend Requests"]'
  );
  const notificationBadge = document.createElement("div");
  notificationBadge.className = "notification-badge";
  friendRequestIcon.appendChild(notificationBadge);

  // Listen for friend request notifications
  socket.on("new_friend_request", ({ fromUser, count }) => {
    updateNotificationBadge(count);
    showToast(`New friend request from ${fromUser.name}`);

    // Update friend requests list if visible
    if (listHeader && listHeader.textContent === "Friend Requests") {
      fetchAndRenderContent("/api/friend-requests");
    }
  });

  // Listen for request count updates
  socket.on("update_request_count", ({ count }) => {
    updateNotificationBadge(count);
  });

  function updateNotificationBadge(count) {
    if (count > 0) {
      notificationBadge.style.display = "flex";
      notificationBadge.textContent = count;
    } else {
      notificationBadge.style.display = "none";
    }
  }

  // Get initial friend request count
  fetch("/api/friend-requests")
    .then((res) => res.json())
    .then((data) => {
      if (data.count > 0) {
        updateNotificationBadge(data.count);
      }
    });

  // Listen for user status changes
  socket.on("user_status_change", ({ userId, isOnline, lastSeen }) => {
    updateUserStatusInUI(userId, isOnline, lastSeen);
  });

  function updateUserStatusInUI(userId, isOnline, lastSeen) {
    // Update status indicators
    const statusIndicators =
      document.querySelectorAll(`[data-user-id="${userId}"] .status-indicator, 
                                                      [data-user-id="${userId}"] .user-details-status-indicator`);
    statusIndicators.forEach((indicator) => {
      if (isOnline) {
        indicator.classList.add("online");
        indicator.style.display = "block";
      } else {
        indicator.classList.remove("online");
        indicator.style.display = "none";
      }
    });

    // Update in user details if open
    const userDetails = document.querySelector(
      `.user-details[data-user-id="${userId}"]`
    );
    if (userDetails) {
      const statusDiv = userDetails.querySelector(".user-status");
      if (statusDiv) {
        statusDiv.innerHTML = isOnline
          ? '<span class="status online">Online</span>'
          : "";
      }
    }
  }

  // Keep theme handling in localStorage
  const themeToggle = document.getElementById("themeToggle");
  const icon = themeToggle.querySelector("i");
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

  // Add navigation functionality
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      navItems.forEach((i) => i.classList.remove("active"));
      // Add active class to clicked item
      item.classList.add("active");

      // Handle different navigation items
      const itemText = item.querySelector("span").textContent;
      if (itemText === "Call History") {
        console.log("Call history clicked");
        // TODO: Implement call history functionality
      }
    });
  });

  // Update navigation functionality with API calls
  const iconNavItems = document.querySelectorAll(".icon-nav-item");
  const listContent = document.querySelector(".list-content");
  const listHeader = document.querySelector(".list-header h3");

  // Get active section from sessionStorage
  const activeSection = sessionStorage.getItem("activeSection") || "Friends";

  // Set initial active section and load content
  setActiveSection(activeSection);

  // Function to set active section and load content
  function setActiveSection(section) {
    // Remove active class from all items
    iconNavItems.forEach((item) => item.classList.remove("active"));

    // Find and activate the correct icon
    const activeIcon = Array.from(iconNavItems).find(
      (item) => item.getAttribute("data-tooltip") === section
    );

    if (activeIcon) {
      activeIcon.classList.add("active");
      if (listHeader) {
        listHeader.textContent = section;
      }

      // Convert section name to API endpoint
      const endpoint = `/api/${section.toLowerCase().replace(/\s+/g, "-")}`;
      fetchAndRenderContent(endpoint);
    }
  }

  // Update click handlers for icon navigation
  iconNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.getAttribute("data-tooltip");
      sessionStorage.setItem("activeSection", section);
      // Clear user details when switching tabs
      sessionStorage.removeItem("currentUserDetails");
      // Reset interaction column to default state
      const interactionColumn = document.querySelector(".interaction-column");
      interactionColumn.innerHTML = `
        <div class="placeholder-message">
          <i class="fas fa-comments"></i>
          <p>Select a chat to start messaging</p>
        </div>
      `;
      setActiveSection(section);
    });
  });

  // Move showSearch function to global scope
  window.showSearch = () => {
    const section = "Search Users";
    sessionStorage.setItem("activeSection", section);
    // Clear user details when going to search
    sessionStorage.removeItem("currentUserDetails");
    // Reset interaction column
    const interactionColumn = document.querySelector(".interaction-column");
    interactionColumn.innerHTML = `
      <div class="placeholder-message">
        <i class="fas fa-comments"></i>
        <p>Select a chat to start messaging</p>
      </div>
    `;
    setActiveSection(section);
  };

  async function fetchAndRenderContent(endpoint) {
    try {
      listContent.innerHTML = '<div class="loading">Loading...</div>';
      const response = await fetch(endpoint);
      const data = await response.json();

      let html = "";

      switch (endpoint) {
        case "/api/friends":
          if (!data.friends || data.friends.length === 0) {
            html = `
              <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>No friends added yet</p>
                <button class="primary-btn" onclick="showSearch()">Find Friends</button>
              </div>
            `;
          } else {
            data.friends.forEach((friend) => {
              html += `
                <div class="user-item" data-user-id="${friend._id}">
                  <div class="profile-container">
                    <img src="${friend.profilePic}" alt="${
                friend.name
              }" class="user-avatar">
                    <div class="status-indicator ${
                      friend.isOnline ? "online" : ""
                    }" 
                         style="display: ${
                           friend.isOnline ? "block" : "none"
                         }"></div>
                  </div>
                  <div class="user-info">
                    <h4>${friend.name}</h4>
                  </div>
                </div>
              `;
            });
          }
          break;

        case "/api/friend-requests":
          if (!data.requests || data.requests.length === 0) {
            html = `
              <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <p>No pending friend requests</p>
              </div>
            `;
          } else {
            data.requests.forEach((request) => {
              html += `
                <div class="request-item">
                  <img src="${request.profilePic}" alt="${request.name}" class="user-avatar">
                  <div class="request-info">
                    <h4>${request.name}</h4>
                    <div class="request-actions">
                      <button class="accept-btn" onclick="handleRequest('${request._id}', 'accept')">Accept</button>
                      <button class="reject-btn" onclick="handleRequest('${request._id}', 'reject')">Reject</button>
                    </div>
                  </div>
                </div>
              `;
            });
          }
          break;

        case "/api/search-users":
          const searchContainer = document.createElement("div");
          searchContainer.className = "search-container";
          searchContainer.innerHTML = `
            <input type="text" id="searchUser" placeholder="Type to filter users..." autocomplete="off">
            <div id="searchResults" class="search-results">
              <div class="loading">Loading users...</div>
            </div>
          `;
          listContent.innerHTML = "";
          listContent.appendChild(searchContainer);

          // Load all users immediately
          loadUsers();
          setupSearchHandler();
          return;

        case "/api/call-history":
          if (!data.history || data.history.length === 0) {
            html = `
              <div class="empty-state">
                <i class="fas fa-phone-slash"></i>
                <p>No call history available</p>
              </div>
            `;
          } else {
            data.history.forEach((call) => {
              html += `
                <div class="call-item">
                  <i class="fas fa-${
                    call.type === "incoming" ? "phone-alt" : "phone-volume"
                  }"></i>
                  <div class="call-info">
                    <h4>${call.name}</h4>
                    <span>${call.duration}</span>
                    <span>${new Date(call.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              `;
            });
          }
          break;
      }

      listContent.innerHTML = html;
    } catch (error) {
      console.error("Error fetching data:", error);
      listContent.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading content</p>
          <button class="retry-btn" onclick="fetchAndRenderContent('${endpoint}')">Retry</button>
        </div>
      `;
    }
  }

  // Add search functionality
  function setupSearchHandler() {
    const searchInput = document.getElementById("searchUser");
    const searchResults = document.getElementById("searchResults");

    if (!searchInput || !searchResults) {
      console.error("Search elements not found");
      return;
    }

    // Focus the input when search is opened
    searchInput.focus();

    // Load all users immediately when search is opened
    loadUsers();

    let debounceTimer;
    searchInput.addEventListener("input", async (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();

      // If query is empty, load all users
      if (query.length === 0) {
        loadUsers();
        return;
      }

      debounceTimer = setTimeout(() => {
        loadUsers(query);
      }, 500);
    });
  }

  // Add this new function
  async function loadUsers(query = "") {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) return;

    searchResults.innerHTML = '<div class="loading">Loading users...</div>';

    try {
      const response = await fetch(
        `/api/search-users${query ? `?q=${encodeURIComponent(query)}` : ""}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (!data.users || data.users.length === 0) {
        searchResults.innerHTML =
          '<div class="empty-search">No users found</div>';
        return;
      }

      const html = data.users
        .map(
          (user) => `
        <div class="user-item" onclick="showUserDetails('${
          user._id
        }')" data-user-id="${user._id}">
          <div class="profile-container">
            <img src="${
              user.profilePic || "/assets/default-avatar.png"
            }" alt="${user.name}" class="user-avatar">
            <div class="status-indicator ${user.isOnline ? "online" : ""}" 
                 style="display: ${user.isOnline ? "block" : "none"}"></div>
          </div>
          <div class="user-info">
            <h4>${user.name}</h4>
          </div>
        </div>
      `
        )
        .join("");

      searchResults.innerHTML = html;
    } catch (error) {
      console.error("Error loading users:", error);
      searchResults.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading users</p>
          <button class="retry-btn" onclick="loadUsers()">Retry</button>
        </div>
      `;
    }
  }

  // In the showUserDetails function, modify the userDetailsHtml template
  window.showUserDetails = async (userId) => {
    const interactionColumn = document.querySelector(".interaction-column");

    // Store the current user details state
    sessionStorage.setItem("currentUserDetails", userId);

    try {
      await renderUserDetails(userId, interactionColumn);
    } catch (error) {
      console.error("Error fetching user details:", error);
      interactionColumn.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading user details</p>
        </div>
      `;
    }
  };

  // Add new function to render user details
  async function renderUserDetails(userId, interactionColumn) {
    const response = await fetch(`/api/user/${userId}`);
    const data = await response.json();

    const userDetailsHtml = `
      <div class="user-details" data-user-id="${userId}">
        <button class="back-button">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="user-details-header">
          <div class="user-details-avatar-container">
            <img src="${
              data.profilePic || "/assets/default-avatar.png"
            }" alt="${data.name}" class="user-details-avatar">
            <div class="user-details-status-indicator ${
              data.isOnline ? "online" : ""
            }" 
                 style="display: ${data.isOnline ? "block" : "none"}"></div>
          </div>
        </div>
        <div class="user-details-content">
          <h2>${data.name}</h2>
          <div class="user-status">
            ${data.isOnline ? '<span class="status online">Online</span>' : ""}
          </div>
          <div class="user-details-info">
            <div class="info-item">
              <i class="fas fa-envelope"></i>
              <span>${data.email}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-phone"></i>
              <span>${data.phone}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              <span>Joined: ${new Date(
                data.createdAt
              ).toLocaleDateString()}</span>
            </div>
          </div>
          <button class="add-friend-btn-large" onclick="window.sendFriendRequest('${userId}')">
            <i class="fas fa-user-plus"></i> Add Friend
          </button>
        </div>
      </div>
    `;

    interactionColumn.innerHTML = userDetailsHtml;

    // Add back button click handler
    const backButton = interactionColumn.querySelector(".back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        hideInteraction();
        // Clear the stored user details on back
        sessionStorage.removeItem("currentUserDetails");
      });

      if (window.innerWidth > 768) {
        backButton.style.display = "none";
      }
    }

    if (window.innerWidth <= 768) {
      showInteraction();
    }
  }

  // Helper function to send friend request
  window.sendFriendRequest = async (userId) => {
    try {
      const button = event.target;
      button.disabled = true;
      button.textContent = "Sending...";

      const response = await fetch("/api/send-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        button.textContent = "Request Sent";
        button.classList.add("sent");
        showToast("Friend request sent successfully");
      } else {
        button.disabled = false;
        button.textContent = "Add Friend";
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      button.disabled = false;
      button.textContent = "Add Friend";
      showToast("Failed to send friend request", "error");
    }
  };

  // Add these helper functions
  function showSearch() {
    const section = document.querySelector('[data-tooltip="Search Users"]');
    section.click();
  }

  async function sendFriendRequest(userId) {
    try {
      const response = await fetch("/api/send-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (data.success) {
        showToast("Friend request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      showToast("Failed to send friend request", "error");
    }
  }

  async function handleRequest(requestId, action) {
    try {
      const response = await fetch("/api/handle-friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await response.json();

      if (data.success) {
        showToast(`Friend request ${action}ed successfully!`);
        fetchAndRenderContent("/api/friend-requests");
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
      showToast(`Failed to ${action} friend request`, "error");
    }
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // Mobile interaction handling
  const isMobile = window.innerWidth <= 768;
  const interactionColumn = document.querySelector(".interaction-column");
  const listColumn = document.querySelector(".list-column");
  const backButton = document.querySelector(".back-button");

  // Function to show chat/interaction view
  function showInteraction() {
    interactionColumn.classList.add("active");
    if (window.innerWidth <= 768) {
      listColumn.classList.add("hidden");
      // Show back button only on mobile
      const backButton = document.querySelector(".back-button");
      if (backButton) backButton.style.display = "flex";
    }
  }

  // Function to hide chat/interaction view
  function hideInteraction() {
    interactionColumn.classList.remove("active");
    listColumn.classList.remove("hidden");
    // Hide back button
    const backButton = document.querySelector(".back-button");
    if (backButton) backButton.style.display = "none";
    // Clear stored user details
    sessionStorage.removeItem("currentUserDetails");
  }

  // Add click handlers for user list items (add this when you populate the list)
  function addUserClickHandlers() {
    const userItems = document.querySelectorAll(".user-item");
    userItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (isMobile) {
          showInteraction();
        }
      });
    });
  }

  // Back button handler
  backButton.addEventListener("click", hideInteraction);

  // Handle window resize
  window.addEventListener("resize", () => {
    const backButton = document.querySelector(".back-button");
    if (window.innerWidth > 768) {
      if (backButton) backButton.style.display = "none";
    } else {
      const interactionColumn = document.querySelector(".interaction-column");
      if (interactionColumn.classList.contains("active") && backButton) {
        backButton.style.display = "flex";
      }
    }
  });

  // Check for stored user details after setting active section
  const storedUserId = sessionStorage.getItem("currentUserDetails");
  if (storedUserId) {
    const interactionColumn = document.querySelector(".interaction-column");
    renderUserDetails(storedUserId, interactionColumn);
  }
});

// Modify logout handler to clear only sessionStorage
document.querySelector(".logout-btn").addEventListener("click", async () => {
  try {
    const socket = io();
    socket.disconnect(); // Disconnect socket
    sessionStorage.clear();

    // Remove all status indicators before logout
    const statusIndicators = document.querySelectorAll(".status-indicator");
    statusIndicators.forEach((indicator) => {
      indicator.classList.remove("online");
    });

    const response = await fetch("/logout", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

    if (data.success) {
      // Create and show toast message
      const toast = document.createElement("div");
      toast.className = "toast success";
      toast.textContent = data.message;
      document.body.appendChild(toast);

      // Redirect after showing message
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1000);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
});
