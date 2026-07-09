import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.MODE === "production" ? "" : import.meta.env.VITE_SERVER_URL,
  withCredentials: true
});

// Axios response interceptor to handle Render free-tier spin-up delays (502, 503, 504)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // If there is no config or the error does not have a response, reject
    if (!config || !response) {
      return Promise.reject(error);
    }

    // Check for gateway/proxy sleep errors
    const retryableStatuses = [502, 503, 504];
    if (!retryableStatuses.includes(response.status)) {
      return Promise.reject(error);
    }

    // Initialize or increment retry count
    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 6;

    if (config.__retryCount >= maxRetries) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Incremental backoff delay: 3s, 6s, 9s
    const delay = config.__retryCount * 3000;
    console.warn(`[Axios] Render container spin-up detected. Retrying request (${config.__retryCount}/${maxRetries}) in ${delay}ms...`);

    // Wait for the specified delay before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Re-execute request with current config
    return api(config);
  }
);

export default api;