// Full API base URL, including /api. Set VITE_API_BASE_URL in Vite env files.
export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL
    ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, "")}/api`
    : undefined) ||
  (import.meta.env.DEV ? "/api" : "https://seth-store-api.onrender.com/api")
).replace(/\/$/, "");

const DEFAULT_API_ORIGIN = "https://seth-store-api.onrender.com";
const API_ASSET_ORIGIN = (
  (import.meta.env.VITE_API_ASSET_ORIGIN as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (API_BASE_URL.startsWith("http")
    ? new URL(API_BASE_URL).origin
    : DEFAULT_API_ORIGIN)
).replace(/\/$/, "");

export const BASE_URL = `${API_BASE_URL}/computer-products`;

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

function getHeaders() {
  const token = localStorage.getItem('seth_token');

  return token
    ? {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      }
    : baseHeaders;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
}

export interface Product {
  id: number;
  name: string;
  brand?: string;
  type?: string;
  specs?: string;
  price: number;
  stock?: number;
  image?: string | File;
  image_url?: string | null;
  category?: ProductCategory | null;
  category_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export function normalizeApiAssetUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const isLocalApiHost =
      parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";

    if (isLocalApiHost && parsed.pathname.startsWith("/storage/")) {
      return `${API_ASSET_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return url;
  } catch {
    if (url.startsWith("/storage/")) {
      return `${API_ASSET_ORIGIN}${url}`;
    }

    return url;
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    image_url: normalizeApiAssetUrl(product.image_url),
    image:
      typeof product.image === "string"
        ? normalizeApiAssetUrl(product.image) ?? product.image
        : product.image,
  };
}

function normalizeProductsResponse(data: unknown): Product[] {
  const list = Array.isArray(data)
    ? data
    : ((data as { data?: Product[] } | null)?.data ?? []);

  return list.map((product) => normalizeProduct(product as Product));
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem('seth_token', data.token);
  return data.user;
}

export function logoutUser(): void {
  localStorage.removeItem('seth_token');
}

export async function fetchAuthUser(): Promise<AuthUser> {
  if (!localStorage.getItem("seth_token")) {
    throw new Error("No auth token");
  }

  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/computer-products
 */
export async function getComputerProducts(): Promise<Product[]> {
  const response = await fetch(BASE_URL, { method: "GET", headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return normalizeProductsResponse(await response.json());
}

/**
 * GET /api/computer-products/:id
 */
export async function getComputerProduct(id: number | string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "GET", headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
  }

  return normalizeProduct(await response.json());
}

/**
 * POST /api/computer-products
 */
export async function createComputerProduct(data: Partial<Product>): Promise<Product> {
  const hasFile = !!data.image;
  let headers: Record<string, string> = getHeaders();
  let body: any;

  if (hasFile) {
    // Delete Content-Type to let browser generate boundary string automatically
    delete headers["Content-Type"];
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });
    body = formData;
  } else {
    body = JSON.stringify(data);
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to create product: ${response.statusText}`);
  }

  return normalizeProduct(await response.json());
}

/**
 * PUT /api/computer-products/:id (Via POST Spoofing when image exists)
 */
export async function updateComputerProduct(
  id: number | string,
  data: Partial<Product>
): Promise<Product> {
  const hasFile = data.image instanceof File;

  if (hasFile) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          value instanceof File ? value : String(value)
        );
      }
    });

    formData.append("_method", "PUT");

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("seth_token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Update failed");
    }

    return normalizeProduct(await response.json());
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("seth_token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Update failed");
  }

  return normalizeProduct(await response.json());
}
/**
 * DELETE /api/computer-products/:id
 */
export async function deleteComputerProduct(id: number | string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product ${id}: ${response.statusText}`);
  }

  return response.status === 204 ? null : response.json();
}
// Add this interface near your other interfaces (AuthUser, Product, etc.)
export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
}

// Add this function near your other fetch calls
export async function getCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : ((data as { data: ProductCategory[] }).data ?? []);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderPayload {
  product_type: string;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  shipping_address: string;
}

export interface Order extends OrderPayload {
  id: number;
  created_at?: string;
}

// POST /api/orders

export async function placeOrder(data: OrderPayload): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to place order");
  }

  return response.json();
}
 
export const COMPUTER_SHOP_ORDERS_URL = `${API_BASE_URL}/computer-shop-orders`;
 
export type ComputerShopOrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
 
export interface ComputerShopOrder {
  id: number;
  user_id: number;
  computer_product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  address: string;
  total_price: number;
  status: ComputerShopOrderStatus;
  created_at: string;
  updated_at: string;
}
 
/**
 * GET /api/computer-shop-orders
 */
export async function fetchComputerShopOrders(): Promise<ComputerShopOrder[]> {
  const response = await fetch(COMPUTER_SHOP_ORDERS_URL, {
    method: "GET",
    headers: getHeaders(),
  });
 
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
 
  return response.json();
}
 
/**
 * GET /api/computer-shop-orders/:id
 */
export async function fetchComputerShopOrder(id: number | string): Promise<ComputerShopOrder> {
  const response = await fetch(`${COMPUTER_SHOP_ORDERS_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
 
  if (!response.ok) {
    throw new Error(`Failed to fetch order ${id}: ${response.statusText}`);
  }
 
  return response.json();
}
 
/**
 * PUT /api/computer-shop-orders/:id
 * Currently only supports updating `status` (matches controller validation).
 */
export async function updateComputerShopOrderStatus(
  id: number | string,
  status: ComputerShopOrderStatus
): Promise<ComputerShopOrder> {
  const response = await fetch(`${COMPUTER_SHOP_ORDERS_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
 
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Failed to update order: ${response.statusText}`);
  }
 
  return response.json();
}
 
/**
 * DELETE /api/computer-shop-orders/:id
 */
export async function deleteComputerShopOrder(id: number | string): Promise<void> {
  const response = await fetch(`${COMPUTER_SHOP_ORDERS_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
 
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Failed to delete order: ${response.statusText}`);
  }
}
 

// customer buy 


export interface PlaceComputerShopOrderPayload {
  computer_product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  address: string;
}
 
/**
 * POST /api/computer-shop-orders
 * Places an order against the computer_shop_orders table.
 * `user_id` and `total_price` are set server-side, not sent from the client.
 */
export async function placeComputerShopOrder(
  data: PlaceComputerShopOrderPayload
): Promise<ComputerShopOrder> {
  const response = await fetch(COMPUTER_SHOP_ORDERS_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
 
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Failed to place order: ${response.statusText}`);
  }
 
  return response.json();
}
// ─── Feedback 

export interface FeedbackPayload {
  subject: string;
  message: string;
}

export interface Feedback extends FeedbackPayload {
  id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * POST /api/feedback
 */
export async function sendFeedback(data: FeedbackPayload): Promise<Feedback> {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Failed to send feedback: ${response.statusText}`);
  }

  return response.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Registration failed: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem('seth_token', data.token);
  return data.user;
}

const API_URL = API_BASE_URL;

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function fetchUsers(): Promise<AppUser[]> {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("seth_token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data ?? json;
}

export async function updateUserRole(id: number, role: string): Promise<AppUser> {
  const res = await fetch(`${API_URL}/users/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("seth_token")}`,
    },
    body: JSON.stringify({ role: role.toLowerCase() }),
  });
  if (!res.ok) {
    let message = "Failed to update user";
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}
