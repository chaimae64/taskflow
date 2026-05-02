const BASE = "http://127.0.0.1:8000";

const headers = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const api = {
  // Auth
  register: (data) =>
    fetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  login: (username, password) => {
    const form = new URLSearchParams({ username, password });
    return fetch(`${BASE}/auth/login`, { method: "POST", body: form }).then(r => r.json());
  },

  me: (token) =>
    fetch(`${BASE}/auth/me`, { headers: headers(token) }).then(r => r.json()),

  // Tasks
  getTasks: (token) =>
    fetch(`${BASE}/tasks`, { headers: headers(token) }).then(r => r.json()),

  createTask: (token, data) =>
    fetch(`${BASE}/tasks`, { method: "POST", headers: headers(token), body: JSON.stringify(data) }).then(r => r.json()),

  updateTask: (token, id, data) =>
    fetch(`${BASE}/tasks/${id}`, { method: "PUT", headers: headers(token), body: JSON.stringify(data) }).then(r => r.json()),

  deleteTask: (token, id) =>
    fetch(`${BASE}/tasks/${id}`, { method: "DELETE", headers: headers(token) }),

  completeTask: (token, id) =>
    fetch(`${BASE}/tasks/${id}/terminer`, { method: "PATCH", headers: headers(token) }).then(r => r.json()),

  // Notifications
  getNotifications: (token) =>
    fetch(`${BASE}/notifications`, { headers: headers(token) }).then(r => r.json()),

  markAllRead: (token) =>
    fetch(`${BASE}/notifications/lire-toutes`, { method: "PATCH", headers: headers(token) }),
};