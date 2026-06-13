const BASE_URL = "http://127.0.0.1:8000/api/computer-products";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

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
  category?: ProductCategory | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/computer-products
 * Fetch all computer products
 */
export async function getComputerProducts(): Promise<Product[]> {
  const response = await fetch(BASE_URL, { method: "GET", headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/computer-products/:id
 * Fetch a single computer product by ID
 */
export async function getComputerProduct(id: number | string): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: "GET", headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST /api/computer-products
 * Create a new computer product
 * @param {Partial<Product>} data - Product payload
 */
export async function createComputerProduct(data: Partial<Product>): Promise<Product> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT /api/computer-products/:id
 * Update an existing computer product by ID
 * @param {number|string} id - Product ID
 * @param {Partial<Product>} data - Updated product payload
 */
export async function updateComputerProduct(id: number | string, data: Partial<Product>): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update product ${id}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * DELETE /api/computer-products/:id
 * Delete a computer product by ID
 * @param {number|string} id - Product ID
 */
export async function deleteComputerProduct(id: number | string): Promise<Product | null> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product ${id}: ${response.statusText}`);
  }

  // 204 No Content — return null, otherwise parse JSON
  return response.status === 204 ? null : response.json();
}
