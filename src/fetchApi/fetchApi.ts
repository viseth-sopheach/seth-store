export const API_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL
    ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, "")}/api`
    : undefined) ||
  (import.meta.env.DEV ? "/api" : "https://seth-store-api.onrender.com/api")
).replace(/\/$/, "");
const BASE_URL = `${API_URL}/drinks`;

const baseHeaders = {
  Accept: "application/json",
};

function getHeaders(isFormData = false) {
  const token = localStorage.getItem("seth_token");
  const headers: Record<string, string> = { ...baseHeaders };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem("seth_token", data.token);
  return data.user;
}

export function logoutUser(): void {
  localStorage.removeItem("seth_token");
}

export async function fetchAuthUser(): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  drinks_count?: number;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  brand?: string;
  type?: string;
  price: number;
  stock?: number;
  category_id?: number;
  image?: string;
  image_url?: string | null;
  category?: ProductCategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPayload {
  name: string;
  brand?: string;
  type?: string;
  price: number;
  stock?: number;
  category_id?: number | null;
  image?: File | null;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type ProductType = "drink" | "book" | "computer" | "phone";

export interface OrderPayload {
  product_type: ProductType;
  product_id:   number;
  product_name: string;
  unit_price:   number;
  quantity:     number;
  table_number: string;
  floor:        string;
}

export interface Order {
  id:           number;
  user_id:      number;
  product_type: ProductType;
  product_id:   number;
  product_name: string;
  unit_price:   number;
  quantity:     number;
  table_number: string;
  floor:        string;
  total_price:  number;
  status:       "pending" | "confirmed" | "delivered" | "cancelled";
  created_at:   string;
  updated_at:   string;
}

export async function placeOrder(payload: OrderPayload): Promise<Order> {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const firstError = body?.errors
      ? Object.values(body.errors as Record<string, string[]>).flat()[0]
      : body?.message;
    throw new Error(firstError || `Failed to place order: ${response.statusText}`);
  }

  return response.json();
}

// ─── FormData helper ──────────────────────────────────────────────────────────

function toFormData(data: ProductPayload, method?: "PUT"): FormData {
  const formData = new FormData();

  if (method) formData.append("_method", method);

  formData.append("name",  data.name);
  formData.append("price", String(data.price));

  if (data.category_id != null) formData.append("category_id", String(data.category_id));
  if (data.brand != null)       formData.append("brand",  data.brand);
  if (data.type  != null)       formData.append("type",   data.type);
  if (data.stock != null)       formData.append("stock",  String(data.stock));
  if (data.image)               formData.append("image",  data.image);

  return formData;
}

// ─── Drink CRUD ───────────────────────────────────────────────────────────────

export async function getComputerProducts(): Promise<Product[]> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

export async function getCategories(): Promise<ProductCategory[]> {
  const response = await fetch(`${API_URL}/categories`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

export async function getComputerProduct(id: number | string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
  }

  return response.json();
}

export async function createComputerProduct(data: ProductPayload): Promise<Product> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: getHeaders(true),
    body: toFormData(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const firstError = body?.errors
      ? Object.values(body.errors as Record<string, string[]>).flat()[0]
      : body?.message;
    throw new Error(firstError || `Failed to create: ${response.statusText}`);
  }

  return response.json();
}

export async function updateComputerProduct(
  id: number | string,
  data: ProductPayload
): Promise<Product> {
  const response = data.image
    ? await fetch(`${BASE_URL}/${id}`, {
        method: "POST",
        headers: getHeaders(true),
        body: toFormData(data, "PUT"),
      })
    : await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(false),
        body: JSON.stringify({
          name:        data.name,
          price:       data.price,
          category_id: data.category_id,
          stock:       data.stock ?? 0,
          ...(data.brand ? { brand: data.brand } : {}),
          ...(data.type  ? { type:  data.type  } : {}),
        }),
      });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const firstError = body?.errors
      ? Object.values(body.errors as Record<string, string[]>).flat()[0]
      : body?.message;
    throw new Error(firstError || `Failed to update: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteComputerProduct(id: number | string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(false),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Failed to delete: ${response.statusText}`);
  }

  return response.status === 204 ? null : response.json();
}
