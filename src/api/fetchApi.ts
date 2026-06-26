export const BASE_URL = "http://127.0.0.1:8000/api/computer-products";

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

function getHeaders() {
  const token = localStorage.getItem('skybot_token');

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

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await fetch("http://127.0.0.1:8000/api/login", {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  localStorage.setItem('skybot_token', data.token);
  return data.user;
}

export function logoutUser(): void {
  localStorage.removeItem('skybot_token');
}

export async function fetchAuthUser(): Promise<AuthUser> {
  const response = await fetch("http://127.0.0.1:8000/api/user", {
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

  return response.json();
}

/**
 * GET /api/computer-products/:id
 */
export async function getComputerProduct(id: number | string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "GET", headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
  }

  return response.json();
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

  return response.json();
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
        Authorization: `Bearer ${localStorage.getItem("skybot_token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || "Update failed");
    }

    return await response.json();
  }

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("skybot_token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Update failed");
  }

  return await response.json();
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
  const response = await fetch("http://127.0.0.1:8000/api/categories", {
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

/**
 * POST /api/orders
 */
export async function placeOrder(data: OrderPayload): Promise<Order> {
  const response = await fetch("http://127.0.0.1:8000/api/orders", {
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