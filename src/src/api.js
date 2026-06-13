const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getToken() { return localStorage.getItem("trampet_token"); }
export function getUser() { try { return JSON.parse(localStorage.getItem("trampet_user")); } catch { return null; } }
export function logout() { localStorage.removeItem("trampet_token"); localStorage.removeItem("trampet_user"); }

function headers() {
  return { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, { method, headers: headers(), ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
export async function login(phone, password) {
  const data = await req("POST", "/api/auth/login", { phone, password });
  if (data.token) { localStorage.setItem("trampet_token", data.token); localStorage.setItem("trampet_user", JSON.stringify(data.user)); }
  return data;
}
export async function register(name, phone, password, role = "customer", city) {
  const data = await req("POST", "/api/auth/register", { name, phone, password, role, city });
  if (data.token) { localStorage.setItem("trampet_token", data.token); localStorage.setItem("trampet_user", JSON.stringify(data.user)); }
  return data;
}

// Restaurants
export const fetchRestaurants = (city, category, search) => {
  const p = new URLSearchParams();
  if (city && city !== "all") p.set("city", city);
  if (category && category !== "all") p.set("category", category);
  if (search) p.set("search", search);
  return req("GET", `/api/restaurants?${p}`);
};
export const fetchRestaurant = (id) => req("GET", `/api/restaurants/${id}`);
export const fetchMyRestaurant = () => req("GET", "/api/restaurants/mine/dashboard");
export const updateRestaurant = (id, data) => req("PUT", `/api/restaurants/${id}`, data);

// Menu
export const fetchMenu = (rid) => req("GET", `/api/menu/${rid}`);
export const addMenuItem = (data) => req("POST", "/api/menu", data);
export const updateMenuItem = (id, data) => req("PUT", `/api/menu/${id}`, data);
export const toggleMenuItem = (id, is_available) => req("PATCH", `/api/menu/${id}/availability`, { is_available });
export const deleteMenuItem = (id) => req("DELETE", `/api/menu/${id}`);

// Orders
export const placeOrder = (data) => req("POST", "/api/orders", data);
export const fetchOrder = (id) => req("GET", `/api/orders/${id}`);
export const fetchMyOrders = () => req("GET", "/api/orders/customer/mine");
export const fetchRestaurantOrders = () => req("GET", "/api/orders/restaurant/active");
export const updateOrderStatus = (id, status) => req("PATCH", `/api/orders/${id}/status`, { status });
export const assignRider = (orderId, rider_id) => req("PATCH", `/api/orders/${orderId}/assign-rider`, { rider_id });

// Riders
export const fetchMyJobs = () => req("GET", "/api/riders/my-jobs");
export const fetchMyEarnings = () => req("GET", "/api/riders/my-earnings");
export const setRiderStatus = (status) => req("PATCH", "/api/riders/status", { status });
export const fetchAllRiders = () => req("GET", "/api/riders");
export const addRider = (data) => req("POST", "/api/riders", data);

// Payments
export const initiateMpesa = (order_id, phone) => req("POST", "/api/payments/mpesa/stkpush", { order_id, phone });

// Admin
export const fetchAdminStats = () => req("GET", "/api/admin/stats");
export const fetchAdminOrders = (status, city) => { const p = new URLSearchParams(); if (status) p.set("status", status); if (city) p.set("city", city); return req("GET", `/api/admin/orders?${p}`); };
export const fetchAdminRestaurants = () => req("GET", "/api/admin/restaurants");
export const updateRestaurantStatus = (id, status, commission_rate) => req("PATCH", `/api/admin/restaurants/${id}/status`, { status, commission_rate });
export const fetchRestaurantPayouts = () => req("GET", "/api/admin/payouts/restaurants");
export const fetchRiderPayouts = () => req("GET", "/api/admin/payouts/riders");
