import axios from "axios";

// Get auth token with validation
export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  // Simple validation to ensure the token at least looks like a JWT
  if (token && token.split(".").length === 3) {
    return token;
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const getUserRole = () => {
  const role = localStorage.getItem("userRole");
  // Default to 'user' if role is not set but user is authenticated
  return role || (isAuthenticated() ? "user" : null);
};

export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const setUserData = ({
  token,
  userId,
  email,
  role,
}: {
  token: string;
  userId: string;
  email: string;
  role?: string | null;
}) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("email", email);
  if (role) {
    localStorage.setItem("userRole", role);
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("userRole");
  window.location.href = "/";
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Axios instance with auth headers
export const authAxios = axios.create();

// Add auth token to every request
authAxios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid - log out user
        console.log(
          "Authentication failed:",
          error.response.data.message || "Session expired"
        );
        logout();
      } else if (error.response.status === 403) {
        // Permission issue but token is valid
        console.log("Permission denied:", error.response.data.message);
      }
    }
    return Promise.reject(error);
  }
);
